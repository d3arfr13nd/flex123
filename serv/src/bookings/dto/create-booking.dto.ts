import { IsInt, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  roomId: number;

  @IsDateString()
  dateStart: string; // ISO 8601 format

  @IsDateString()
  dateEnd: string; // ISO 8601 format
}

