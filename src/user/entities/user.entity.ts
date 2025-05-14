import { Exclude } from 'class-transformer';
import { RoleUser } from 'src/auth/entities/role.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;



  @Column()
  name: string;

  @Column({ nullable: true })
  lastname: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ default: 0 })
  noShowCount: number;

  @Column({ nullable: true, type: 'date' })
  dateDebutContrat?: Date;




  @Column('text', { nullable: true })
  resetToken: string | null;

  @Column('timestamp', { nullable: true })
  resetTokenExpires: Date | null;


  @ManyToOne(() => RoleUser, (role) => role.user, { eager: true })
  role: RoleUser;



}



