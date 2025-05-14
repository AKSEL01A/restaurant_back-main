import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TableRepository } from './repositories/table.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTableDto } from './types/dtos/create-table.dto';
import { UpdateTableDto } from './types/update-table.dto';
import { TableRestaurant } from './entities/table.entity';
import { RestaurantBlocRepository } from 'src/restaurants/repositories/restaurant-bloc.repository';
import { RestaurantBloc } from 'src/restaurants/entities/Restaurant-Bloc.entity';
import { TableStatus } from './enums/status.enums';
import { ReservationTable } from 'src/reservations/entities/reservation.entity';
import { ReservationRepository } from 'src/reservations/repositories/reservation.repository';
import { Not } from 'typeorm';


@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(TableRestaurant)
    private readonly TableRepository: TableRepository,
    @InjectRepository(RestaurantBloc)
    private readonly restaurantBlocRepository: RestaurantBlocRepository,
    @InjectRepository(ReservationTable)
    private readonly reservationRepository: ReservationRepository,) { }

  async countTables(): Promise<number> {
    return this.TableRepository.count();
  }
  async createTable(dto: CreateTableDto): Promise<TableRestaurant> {
    const bloc = await this.restaurantBlocRepository.findOne({
      where: { id: dto.restaurantBlocId },
      relations: ['tables'],
    });

    if (!bloc) {
      throw new NotFoundException('RestaurantBloc not found');
    }

    const currentTableCount = bloc.tables.length;
    const currentTotalChairs = bloc.tables.reduce(
      (sum, table) => sum + table.numChaises,
      0
    );

    const newTableChairs = dto.numChaises;

    const tableLimitReached = currentTableCount + 1 > bloc.maxTables;
    const chairLimitReached = currentTotalChairs + newTableChairs > bloc.maxChaises;

    if (tableLimitReached || chairLimitReached) {
      const errors: string[] = [];
      if (tableLimitReached) errors.push(`maxTables dépassé (${bloc.maxTables})`);
      if (chairLimitReached) errors.push(`maxChaises dépassé (${bloc.maxChaises})`);
      throw new BadRequestException({
        message: 'Bloc plein',
        errors: errors,
      });

    }

    const table = this.TableRepository.create({
      name: dto.name,
      numChaises: dto.numChaises,
      status: dto.status,
      view: dto.view,
      row: dto.row,
      col: dto.col,
      shape: dto.shape,
      restaurantBloc: bloc,
    });

    return await this.TableRepository.save(table);
  }















  async getTable() {
    return this.TableRepository.find();
  }
  async getTableById(id: string) {
    const table = await this.TableRepository.findOne({
      where: { id: id },
      relations: ['restaurantBloc', 'restaurantBloc.bloc']  // <= charge les relations !
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return table;
  }
  // async updateTable(id: string, updateTableDto: UpdateTableDto) {
  //   const table = await this.TableRepository.findOne({
  //     where: { id },
  //     relations: ['reservations'],
  //   });

  //   if (!table) {
  //     throw new NotFoundException(`Table with ID ${id} not found`);
  //   }

  //   const hasReservations = table.reservations?.length > 0;

  //   if (hasReservations) {
  //     throw new BadRequestException(
  //       'Impossible de modifier cette table car elle est déjà réservée.'
  //     );
  //   }

  //   Object.assign(table, updateTableDto);
  //   return await this.TableRepository.save(table);
  // }
  async updateTable(id: string, updateTableDto: UpdateTableDto) {
    const table = await this.TableRepository.findOne({
      where: { id },
      relations: ['reservations'],
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    // ✅ Vérifier s’il y a une réservation future
    const now = new Date();

    const hasFutureReservation = table.reservations?.some(res => {
      const time = res.reservationTime;

      if (!time?.date2 || !time?.startTime) return false;

      const dateStr = new Date(time.date2).toISOString().split('T')[0];
      const fullDateTimeStr = `${dateStr}T${time.startTime}`;
      const reservationDate = new Date(fullDateTimeStr);

      return reservationDate > now;
    });

    if (hasFutureReservation) {
      throw new BadRequestException(
        "Impossible de modifier cette table car elle est déjà réservée à une date future."
      );
    }

    // Vérifier la position
    const otherTable = await this.TableRepository.findOne({
      where: {
        restaurantBloc: { id: updateTableDto.restaurantBlocId ?? table.restaurantBloc.id },
        row: updateTableDto.row,
        col: updateTableDto.col,
        id: Not(id),
      },
    });

    if (otherTable) {
      throw new BadRequestException(
        `La position (${updateTableDto.row}, ${updateTableDto.col}) est déjà occupée par une autre table.`
      );
    }

    Object.assign(table, updateTableDto);
    return await this.TableRepository.save(table);
  }



  async delete(id: string) {
    const table = await this.TableRepository.findOne({ where: { id } });

    if (!table) {
      throw new NotFoundException(`Table avec l'ID ${id} non trouvée.`);
    }

    // Vérifie si la table est liée à une réservation non annulée
    const activeReservations = await this.reservationRepository.count({
      where: {
        table: { id },
        isCancelled: false,
      },
    });

    if (activeReservations > 0) {
      throw new BadRequestException('Impossible de supprimer cette table : elle est actuellement réservée.');
    }

    await this.TableRepository.delete(id);
    return { message: 'Table supprimée avec succès.' };
  }



  async updateStatus(id: string, status: string) {
    const table = await this.TableRepository.findOneBy({ id });

    if (!table) {
      throw new NotFoundException('Table non trouvée');
    }


    if (!Object.values(TableStatus).includes(status as TableStatus)) {
      throw new BadRequestException('Statut invalide');
    }

    table.status = status as TableStatus;
    console.log('status', status, table);
    return await this.TableRepository.save(table);
  }
}