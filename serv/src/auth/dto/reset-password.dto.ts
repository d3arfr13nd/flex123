import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Пароль повинен містити принаймні 8 символів' })
  newPassword: string;
}


