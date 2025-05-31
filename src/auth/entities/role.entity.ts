import { Entity, PrimaryGeneratedColumn, Column,OneToMany } from 'typeorm';

import { User } from 'src/user/entities/user.entity';


@Entity()
export class RoleUser {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  name: string;

  
  @OneToMany(() => User, (user) => user.role)
  user: User[];

  
}
