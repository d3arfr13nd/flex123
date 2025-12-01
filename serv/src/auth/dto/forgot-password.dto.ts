import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Електронна адреса повинна бути валідною' })
  email: string;
}


