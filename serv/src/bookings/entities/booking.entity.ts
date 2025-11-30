import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';

export enum BookingStatus {
  Pending = 'pending',
  Paid = 'paid',
  Cancelled = 'cancelled',
  Done = 'done',
}

@Entity('bookings')
@Index(['roomId', 'dateStart', 'dateEnd'])
@Index(['userId'])
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'userId' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', name: 'roomId' })
  @Index()
  roomId: number;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ type: 'timestamptz', name: 'dateStart' })
  @Index()
  dateStart: Date;

  @Column({ type: 'timestamptz', name: 'dateEnd' })
  @Index()
  dateEnd: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.Pending,
  })
  @Index()
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'totalPrice' })
  totalPrice: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'idempotencyKey' })
  @Index()
  idempotencyKey: string | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

