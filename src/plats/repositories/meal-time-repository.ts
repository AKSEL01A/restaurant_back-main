import { DataSource, Repository } from "typeorm";
import { MealTimeEntity } from "../entities/meal-time.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MealTimeRepository extends Repository<MealTimeEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(MealTimeEntity, dataSource.createEntityManager());
    }
}