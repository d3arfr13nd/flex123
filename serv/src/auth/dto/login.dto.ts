import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Електронна адреса повинна бути валідною' })
  email: string;

  @IsString()
  password: string;
}


