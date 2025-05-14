import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({ default: 3 })
  maxNoShowAllowed: number;

  @Column({ default: 120 })
  maxCancelTimeBeforeReservation: number;

  @Column({ default: 180 })
  maxReportTimeBeforeReservation: number;

  @Column({ default: 2 })
  maxReportAllowed: number;


  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
