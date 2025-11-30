import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { FilterRoomsDto } from './dto/filter-rooms.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    // Check if slug already exists
    const existingRoom = await this.roomRepository.findOne({
      where: { slug: createRoomDto.slug },
    });

    if (existingRoom) {
      throw new ConflictException('Room with this slug already exists');
    }

    const room = this.roomRepository.create({
      ...createRoomDto,
      amenities: createRoomDto.amenities || [],
      photos: createRoomDto.photos || [],
      status: createRoomDto.status || RoomStatus.Active,
    });

    return await this.roomRepository.save(room);
  }

  async findAll(filters?: FilterRoomsDto): Promise<Room[]> {
    const queryBuilder = this.roomRepository.createQueryBuilder('room');

    // Apply filters
    if (filters?.type) {
      queryBuilder.andWhere('room.type = :type', { type: filters.type });
    }

    if (filters?.capacity) {
      queryBuilder.andWhere('room.capacity >= :capacity', {
        capacity: filters.capacity,
      });
    }

    if (filters?.minCapacity !== undefined) {
      queryBuilder.andWhere('room.capacity >= :minCapacity', {
        minCapacity: filters.minCapacity,
      });
    }

    if (filters?.maxCapacity !== undefined) {
      queryBuilder.andWhere('room.capacity <= :maxCapacity', {
        maxCapacity: filters.maxCapacity,
      });
    }

    if (filters?.minPrice !== undefined) {
      queryBuilder.andWhere('room.priceHour >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters?.maxPrice !== undefined) {
      queryBuilder.andWhere('room.priceHour <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    // Search filter - search in name, description, and slug
    if (filters?.search) {
      queryBuilder.andWhere(
        '(room.name ILIKE :search OR room.description ILIKE :search OR room.slug ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Filter by status - only show active rooms for public endpoints
    queryBuilder.andWhere('room.status = :status', {
      status: RoomStatus.Active,
    });

    // If date is provided, filter rooms that are available on that date
    // This is a placeholder - in a real system, you'd check against bookings
    if (filters?.date) {
      // For now, we'll just return all active rooms
      // In production, you'd join with a bookings table and filter out booked rooms
    }

    queryBuilder.orderBy('room.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async findBySlug(slug: string): Promise<Room | null> {
    return await this.roomRepository.findOne({
      where: { slug },
    });
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    // Check if slug is being updated and if it conflicts with another room
    if (updateRoomDto.slug && updateRoomDto.slug !== room.slug) {
      const existingRoom = await this.findBySlug(updateRoomDto.slug);
      if (existingRoom && existingRoom.id !== id) {
        throw new ConflictException('Room with this slug already exists');
      }
      room.slug = updateRoomDto.slug;
    }

    // Update other fields
    if (updateRoomDto.name !== undefined) {
      room.name = updateRoomDto.name;
    }

    if (updateRoomDto.type !== undefined) {
      room.type = updateRoomDto.type;
    }

    if (updateRoomDto.capacity !== undefined) {
      room.capacity = updateRoomDto.capacity;
    }

    if (updateRoomDto.priceHour !== undefined) {
      room.priceHour = updateRoomDto.priceHour;
    }

    if (updateRoomDto.amenities !== undefined) {
      room.amenities = updateRoomDto.amenities;
    }

    if (updateRoomDto.photos !== undefined) {
      room.photos = updateRoomDto.photos;
    }

    if (updateRoomDto.description !== undefined) {
      room.description = updateRoomDto.description;
    }

    if (updateRoomDto.location !== undefined) {
      room.location = updateRoomDto.location;
    }

    if (updateRoomDto.status !== undefined) {
      room.status = updateRoomDto.status;
    }

    return await this.roomRepository.save(room);
  }

  async remove(id: number): Promise<void> {
    const result = await this.roomRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
  }

  async getAvailability(
    id: number,
    date: string,
  ): Promise<{ timeSlots: Array<{ start: string; end: string; available: boolean }> }> {
    const room = await this.findOne(id);

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    // Generate time slots for the day (9 AM to 6 PM, hourly slots)
    const timeSlots: Array<{ start: string; end: string; available: boolean }> = [];
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    // Generate hourly slots from 9 AM to 6 PM
    for (let hour = 9; hour < 18; hour++) {
      const start = new Date(baseDate);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(baseDate);
      end.setHours(hour + 1, 0, 0, 0);

      // Format as ISO strings
      const startStr = start.toISOString();
      const endStr = end.toISOString();

      // TODO: Check against bookings table to determine availability
      // For now, all slots are marked as available
      // In production, you'd query a bookings table:
      // const hasBooking = await this.bookingsRepository.findOne({
      //   where: {
      //     roomId: id,
      //     startTime: LessThan(end),
      //     endTime: MoreThan(start),
      //     status: 'confirmed',
      //   },
      // });
      // available: !hasBooking

      timeSlots.push({
        start: startStr,
        end: endStr,
        available: true, // Placeholder - should check against bookings
      });
    }

    return { timeSlots };
  }

  async addPhotos(id: number, photoUrls: string[]): Promise<Room> {
    const room = await this.findOne(id);

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    // Add new photos to existing photos array
    room.photos = [...(room.photos || []), ...photoUrls];

    return await this.roomRepository.save(room);
  }
}

