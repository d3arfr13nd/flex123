import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Ім\'я повинно містити принаймні 2 символи' })
  name: string;

  @IsEmail({}, { message: 'Електронна адреса повинна бути валідною' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Пароль повинен містити принаймні 8 символів' })
  password: string;
}


