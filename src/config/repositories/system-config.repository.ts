import { DataSource, Repository } from "typeorm";
import { SystemConfig } from "../entities/config.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SystemConfigRepository extends Repository<SystemConfig> {
  constructor(private readonly dataSource: DataSource) {
    super(SystemConfig, dataSource.createEntityManager());
  }
}