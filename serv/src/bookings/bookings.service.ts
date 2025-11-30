import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private roomsService: RoomsService,
  ) {}

  async create(
    userId: number,
    createBookingDto: CreateBookingDto,
    idempotencyKey?: string,
  ): Promise<Booking> {
    const { roomId, dateStart, dateEnd } = createBookingDto;

    // Check if idempotency key exists
    if (idempotencyKey) {
      const existingBooking = await this.bookingRepository.findOne({
        where: { idempotencyKey },
      });

      if (existingBooking) {
        return existingBooking;
      }
    }

    // Validate dates
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Verify room exists
    const room = await this.roomsService.findOne(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Check for overlapping bookings at DB level
    // A booking overlaps if:
    // - Its start is before the new booking's end AND
    // - Its end is after the new booking's start
    // AND status is not cancelled
    const overlappingBooking = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.roomId = :roomId', { roomId })
      .andWhere('booking.status != :cancelledStatus', {
        cancelledStatus: BookingStatus.Cancelled,
      })
      .andWhere(
        '(booking.dateStart < :endDate AND booking.dateEnd > :startDate)',
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      )
      .getOne();

    if (overlappingBooking) {
      throw new ConflictException(
        'This time slot is already booked. Please choose a different time.',
      );
    }

    // Calculate total price
    const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const totalPrice = Number((hours * Number(room.priceHour)).toFixed(2));

    // Create booking
    const booking = this.bookingRepository.create({
      userId,
      roomId,
      dateStart: startDate,
      dateEnd: endDate,
      status: BookingStatus.Pending,
      totalPrice,
      idempotencyKey: idempotencyKey || null,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Load relations
    const bookingWithRelations = await this.bookingRepository.findOne({
      where: { id: savedBooking.id },
      relations: ['room', 'user'],
    });

    if (!bookingWithRelations) {
      throw new NotFoundException('Failed to load booking after creation');
    }

    return bookingWithRelations;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: { status?: string; dateStart?: string; dateEnd?: string },
  ): Promise<{ data: Booking[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.room', 'room')
      .leftJoinAndSelect('booking.user', 'user');

    // Apply status filter
    if (filters?.status) {
      queryBuilder.andWhere('booking.status = :status', { status: filters.status });
    }

    // Apply date range filters
    if (filters?.dateStart) {
      queryBuilder.andWhere('booking.dateStart >= :dateStart', {
        dateStart: `${filters.dateStart}T00:00:00.000Z`,
      });
    }

    if (filters?.dateEnd) {
      queryBuilder.andWhere('booking.dateStart <= :dateEnd', {
        dateEnd: `${filters.dateEnd}T23:59:59.999Z`,
      });
    }

    queryBuilder
      .orderBy('booking.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [bookings, total] = await queryBuilder.getManyAndCount();

    return { data: bookings, total, page, limit };
  }

  async findByUser(userId: number): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { userId },
      relations: ['room'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId?: number, isAdmin?: boolean): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['room', 'user'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Check access: user can only see their own bookings, admin can see all
    if (!isAdmin && userId && booking.userId !== userId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }

  async cancel(id: number, userId: number, isAdmin: boolean): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Check access
    if (!isAdmin && booking.userId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this booking');
    }

    // Check if booking can be cancelled
    if (booking.status === BookingStatus.Cancelled) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.Done) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    // Policy: Allow cancellation if status is pending or paid
    // In a real system, you might add time-based restrictions (e.g., must cancel 24h before)
    if (booking.status !== BookingStatus.Pending && booking.status !== BookingStatus.Paid) {
      throw new BadRequestException(
        `Cannot cancel booking with status: ${booking.status}`,
      );
    }

    booking.status = BookingStatus.Cancelled;
    const updatedBooking = await this.bookingRepository.save(booking);

    const bookingWithRelations = await this.bookingRepository.findOne({
      where: { id: updatedBooking.id },
      relations: ['room', 'user'],
    });

    if (!bookingWithRelations) {
      throw new NotFoundException('Failed to load booking after cancellation');
    }

    return bookingWithRelations;
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Validate status transition
    if (updateStatusDto.status === BookingStatus.Cancelled && booking.status === BookingStatus.Done) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    booking.status = updateStatusDto.status;
    const updatedBooking = await this.bookingRepository.save(booking);

    const bookingWithRelations = await this.bookingRepository.findOne({
      where: { id: updatedBooking.id },
      relations: ['room', 'user'],
    });

    if (!bookingWithRelations) {
      throw new NotFoundException('Failed to load booking after status update');
    }

    return bookingWithRelations;
  }
}

