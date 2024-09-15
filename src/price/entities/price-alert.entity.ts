import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class PriceAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain: string;

  @Column('decimal', { precision: 18, scale: 8 })
  price: number;

  @Column()
  direction: 'above' | 'below';

  @Column()
  email: string;

  @Column({ default: false })
  isTriggered: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
