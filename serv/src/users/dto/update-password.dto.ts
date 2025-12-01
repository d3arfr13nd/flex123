import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(8, { message: 'Пароль повинен містити принаймні 8 символів' })
  newPassword: string;
}


