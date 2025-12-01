import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
    });

    const tokens = await this.generateTokens(user.id, user.role, user.tokenVersion);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Невірні облікові дані');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Невірні облікові дані');
    }

    const tokens = await this.generateTokens(user.id, user.role, user.tokenVersion);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refresh(userId: number, oldTokenVersion: number) {
    const user = await this.usersService.findOne(userId);

    // Check if token version matches
    if (user.tokenVersion !== oldTokenVersion) {
      throw new UnauthorizedException('Токен було скасовано');
    }

    // Rotate token: increment version
    await this.usersService.incrementTokenVersion(userId);

    const newUser = await this.usersService.findOne(userId);
    const tokens = await this.generateTokens(newUser.id, newUser.role, newUser.tokenVersion);

    return tokens;
  }

  async logout(userId: number) {
    // Increment token version to invalidate all tokens
    await this.usersService.incrementTokenVersion(userId);
    return { message: 'Вихід виконано успішно' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      // Don't reveal if user exists
      return { message: 'Якщо електронна адреса існує, посилання для скидання пароля було надіслано' };
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { userId: user.id, type: 'password-reset' },
      {
        secret: this.configService.get<string>('JWT_SECRET', 'your-secret-key'),
        expiresIn: '1h',
      },
    );

    // Send password reset link via email
    await this.emailService.sendPasswordResetLink(user.email, user.name, resetToken);

    return { message: 'Якщо електронна адреса існує, посилання для скидання пароля було надіслано' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token, {
        secret: this.configService.get<string>('JWT_SECRET', 'your-secret-key'),
      });

      if (payload.type !== 'password-reset') {
        throw new BadRequestException('Невірний токен скидання');
      }

      const user = await this.usersService.findOne(payload.userId);

      // Hash new password
      const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, 10);

      // Update password and increment token version
      await this.usersService.resetPasswordById(user.id, passwordHash);

      // Send confirmation email
      await this.emailService.sendPasswordResetConfirmation(user.email, user.name);

      return { message: 'Пароль успішно скинуто' };
    } catch (error) {
      throw new BadRequestException('Невірний або застарілий токен скидання');
    }
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findOne(userId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async generateTokens(userId: number, role: string, tokenVersion: number) {
    const payload = { userId, role, tokenVersion };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'your-secret-key'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    } as any);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'your-refresh-secret-key'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    } as any);

    return {
      accessToken,
      refreshToken,
    };
  }
}

