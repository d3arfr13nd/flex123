import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RoomType {
  Desk = 'desk',
  Vip = 'vip',
  Meeting = 'meeting',
  Conference = 'conference',
}

export enum RoomStatus {
  Active = 'active',
  Inactive = 'inactive',
  Maintenance = 'maintenance',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: RoomType,
  })
  @Index()
  type: RoomType;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'priceHour' })
  priceHour: number;

  @Column({ type: 'text', array: true, default: '{}' })
  amenities: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  photos: string[];

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  location: {
    lat: number;
    lng: number;
    address: string;
  } | null;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.Active,
  })
  @Index()
  status: RoomStatus;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

