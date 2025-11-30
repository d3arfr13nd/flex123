import {
  IsString,
  IsEnum,
  IsInt,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  IsObject,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoomType, RoomStatus } from '../entities/room.entity';

class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  @MinLength(1)
  address: string;
}

export class CreateRoomDto {
  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsNumber()
  @Min(0)
  priceHour: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}

