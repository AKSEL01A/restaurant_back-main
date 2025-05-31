import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RoleUser } from '../entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<RoleUser> {
  constructor(private readonly dataSource: DataSource) {
    super(RoleUser, dataSource.createEntityManager());
  }
}
