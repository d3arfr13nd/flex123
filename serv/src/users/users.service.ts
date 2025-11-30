import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const { name, email, password, role } = createUserDto;

    // Check if user exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      name,
      email,
      passwordHash,
      role: role || UserRole.User,
      tokenVersion: 0,
    });

    const savedUser = await this.userRepository.save(user);

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: { role?: UserRole; search?: string },
  ): Promise<{ data: Omit<User, 'passwordHash'>[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (filters?.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'user.tokenVersion',
        'user.createdAt',
        'user.updatedAt',
      ]);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'tokenVersion', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email !== undefined && updateUserDto.email !== user.email) {
      // Check if email is already taken by another user
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already taken');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.role !== undefined) {
      user.role = updateUserDto.role;
    }

    const updatedUser = await this.userRepository.save(user);

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto): Promise<string> {
    const user = await this.userRepository.findOneBy({
      id: id,
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.passwordHash,
    );

    if (!isOldPasswordValid) {
      throw new ConflictException('Old password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    // Update password and increment token version to invalidate old tokens
    user.passwordHash = newPasswordHash;
    user.tokenVersion += 1;
    console.log(user);
    await this.userRepository.save(user);
    return 'Password updated successfully';
  }

  async incrementTokenVersion(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      user.tokenVersion += 1;
      await this.userRepository.save(user);
    }
  }

  async resetPasswordById(id: number, newPasswordHash: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      user.passwordHash = newPasswordHash;
      user.tokenVersion += 1;
      await this.userRepository.save(user);
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
