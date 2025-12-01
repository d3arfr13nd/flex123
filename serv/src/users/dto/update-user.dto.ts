import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Ім\'я повинно містити принаймні 2 символи' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Електронна адреса повинна бути валідною' })
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}


