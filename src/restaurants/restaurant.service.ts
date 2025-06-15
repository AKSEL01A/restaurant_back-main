import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RestaurantRepository } from './repositories/restaurant.repository';
import { CreateRestaurantDto } from './types/dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './types/dto/update-restaurant.dto';
import { RestaurantStatus } from './enums/status.enum';
import { ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantBloc } from './entities/Restaurant-Bloc.entity';
import { Bloc } from 'src/bloc/entities/bloc.entity';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { RestaurantImage } from 'src/image/image.entity';
import { Restaurant } from './entities/restaurant.entity';
import { TablesService } from 'src/tables/tables.service';
import { TableRepository } from 'src/tables/repositories/table.repository';
import { TableRestaurant } from 'src/tables/entities/table.entity';
import { UpdateRestaurantBlocDto } from './types/dto/update-restaurant-bloc.dto';
import { RestaurantBlocDto } from './types/dto/create-restaurant-bloc.dto';
@Injectable()
export class RestaurantService {

  constructor
    (
      @InjectRepository(RestaurantBloc)
      private readonly restaurantBlocRepository: Repository<RestaurantBloc>,

      @InjectRepository(Bloc)
      private readonly blocRepository: Repository<Bloc>,

      @InjectRepository(RestaurantImage)
      private restaurantImageRepository: Repository<RestaurantImage>,
      @InjectRepository(Restaurant)
      private restaurantRepository: Repository<Restaurant>,
      @InjectRepository(TableRestaurant)
      private tableRepository: Repository<TableRestaurant>
    ) { }



  async countRestaurants(): Promise<number> {
    return this.restaurantRepository.count();
  }


  async getRestaurantById(id: string) {
    const fetchedRestaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['restaurantBlocs', 'restaurantBlocs.bloc', 'images'],
    });

    if (!fetchedRestaurant) {
      throw new BadRequestException(`Restaurant with ID ${id} not found`);
    }

    if (fetchedRestaurant.hourly) {
      const [start, end] = fetchedRestaurant.hourly.split('-');
      const nowHour = new Date().getHours();

      const startHour = parseInt(start);
      const endHour = parseInt(end);

      let isOpen = false;

      if (!isNaN(startHour) && !isNaN(endHour)) {
        if (startHour < endHour) {
          isOpen = nowHour >= startHour && nowHour < endHour;
        } else {
          isOpen = nowHour >= startHour || nowHour < endHour;
        }
      }

      console.log({
        id,
        hourly: fetchedRestaurant.hourly,
        nowHour,
        startHour,
        endHour,
        isOpen,
      });

      fetchedRestaurant.status = isOpen ? RestaurantStatus.OUVERT : RestaurantStatus.FERME;
    }

    return fetchedRestaurant;
  }



  async getRestaurant(query: { search?: string; isActive?: string, categorie?: string }) {
    const { search, isActive, categorie } = query;
    const where: any = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }
    if (categorie) {
      where.categorie = ILike(`%${categorie}%`);
    }


    if (isActive === 'true') {
      where.isActive = true;
    } else if (isActive === 'false') {
      where.isActive = false;
    }



    const restaurants = await this.restaurantRepository.find({
      where,
      relations: {
        restaurantBlocs: {
          bloc: true
        },
        images: true
      }
    });


    const nowHour = new Date().getHours();
    for (const r of restaurants) {
      if (r.hourly) {
        const [start, end] = r.hourly.split('-');
        const startHour = parseInt(start);
        const endHour = parseInt(end);
        const isOpen = nowHour >= startHour && nowHour < endHour;
        r.status = isOpen ? RestaurantStatus.OUVERT : RestaurantStatus.FERME;
      }
    }

    return restaurants;
  }






  async createRestaurant(dto: CreateRestaurantDto) {
    const [start, end] = dto.hourly.split('-');
    const nowHour = new Date().getHours();
    const startHour = parseInt(start);
    const endHour = parseInt(end);
    const isOpen = nowHour >= startHour && nowHour < endHour;

    const { restaurantBlocs, images, ...rest } = dto;


    const restaurant = this.restaurantRepository.create({
      ...rest,
      status: isOpen ? RestaurantStatus.OUVERT : RestaurantStatus.FERME,
    });


    restaurant.restaurantBlocs = [];

    for (const blocData of restaurantBlocs) {
      if (!blocData.blocId) {
        throw new BadRequestException(`blocId manquant pour un des blocs.`);
      }
      const bloc = await this.blocRepository.findOneBy({ id: blocData.blocId });
      if (!bloc) {
        throw new NotFoundException(`Bloc avec ID ${blocData.blocId} introuvable`);
      }

      if (blocData.maxTables === undefined || blocData.maxTables <= 0) {
        throw new BadRequestException(`maxTables est requis et doit être > 0 pour le bloc ${bloc.id}`);
      }

      if (blocData.maxChaises === undefined || blocData.maxChaises <= 0) {
        throw new BadRequestException(`maxChaises est requis et doit être > 0 pour le bloc ${bloc.id}`);
      }


      const restaurantBloc = new RestaurantBloc();
      restaurantBloc.bloc = bloc;
      restaurantBloc.restaurant = restaurant;
      restaurantBloc.maxTables = blocData.maxTables;
      restaurantBloc.maxChaises = blocData.maxChaises;


      restaurant.restaurantBlocs.push(restaurantBloc);
    }

    const savedRestaurant = await this.restaurantRepository.save(restaurant);

    if (images && images.length > 0) {
      for (const img of images) {
        const restaurantImage = this.restaurantImageRepository.create({
          url: img.url,
          restaurant: { id: savedRestaurant.id } as Restaurant,
        });
        await this.restaurantImageRepository.save(restaurantImage);
      }
    }


    return plainToInstance(CreateRestaurantDto, savedRestaurant, {
      excludeExtraneousValues: true,
    });

  }


  async addBlocToRestaurant(restaurantId: string, dto: RestaurantBlocDto) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
      relations: ['restaurantBlocs'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant non trouvé');
    }

    const bloc = await this.blocRepository.findOneBy({ id: dto.blocId });
    if (!bloc) {
      throw new NotFoundException('Bloc non trouvé');
    }

    const existingBloc = restaurant.restaurantBlocs.find(rb => rb.bloc.id === bloc.id);
    if (existingBloc) {
      throw new BadRequestException('Ce bloc est déjà associé au restaurant');
    }

    const newBloc = this.restaurantBlocRepository.create({
      bloc,
      maxTables: dto.maxTables,
      maxChaises: dto.maxChaises,
      restaurant,
    });

    await this.restaurantBlocRepository.save(newBloc);
    return { message: 'Bloc ajouté avec succès' };
  }


  async deleteRestaurant(id: string) {
    const restaurant = await this.restaurantRepository.findOneBy({ id });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    await this.restaurantRepository.delete(id);
    return { message: `Restaurant with ID ${id} deleted successfully` };
  }



  async patchRestaurantInfo(id: string, updateDto: UpdateRestaurantDto) {
    if (!Object.keys(updateDto).length) {
      throw new BadRequestException("Aucune donnée à mettre à jour.");
    }

    if (updateDto.restaurantBlocs) {
      delete updateDto.restaurantBlocs; // na7i blocs ken ma 7achtekch bihom
    }

    const restaurant = await this.restaurantRepository.findOne({ where: { id } });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant avec ID ${id} introuvable.`);
    }

    Object.assign(restaurant, updateDto);
    return instanceToPlain(await this.restaurantRepository.save(restaurant));
  }
  async patchRestaurantBlocs(id: string, blocsDto: UpdateRestaurantBlocDto[]) {
    if (!Array.isArray(blocsDto)) {
      throw new BadRequestException("Le corps de la requête doit être un tableau.");
    }

    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['restaurantBlocs'],
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant avec ID ${id} introuvable.`);
    }

    const updatedBlocs = await Promise.all(
      blocsDto.map(async (blocDto) => {
        const blocExists = await this.blocRepository.findOne({
          where: { id: blocDto.blocId },
        });

        if (!blocExists) {
          throw new NotFoundException(`Bloc avec ID ${blocDto.blocId} introuvable.`);
        }

        let blocEntity = await this.restaurantBlocRepository.findOne({
          where: {
            bloc: { id: blocDto.blocId },
            restaurant: { id },
          },
          relations: ['tables'], // on les charge mais on ne les modifie pas
        });

        if (!blocEntity) {
          blocEntity = new RestaurantBloc();
          blocEntity.restaurant = restaurant;
          blocEntity.bloc = blocExists;
          blocEntity.tables = []; // cas nouveau bloc
        }

        // Met à jour uniquement les valeurs numériques
        if (blocDto.maxTables !== undefined) {
          blocEntity.maxTables = blocDto.maxTables;
        }

        if (blocDto.maxChaises !== undefined) {
          blocEntity.maxChaises = blocDto.maxChaises;
        }

        // Ne pas toucher aux tables existantes
        return await this.restaurantBlocRepository.save(blocEntity);
      })
    );

    return instanceToPlain(updatedBlocs);
  }

  async deactivateRestaurant(id: string) {
    const restaurant = await this.restaurantRepository.findOneBy({ id });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    restaurant.isActive = false;
    return await this.restaurantRepository.save(restaurant);
  }
  async toggleActive(id: string) {
    const restaurant = await this.restaurantRepository.findOneBy({ id });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    restaurant.isActive = !restaurant.isActive;

    return this.restaurantRepository.save(restaurant);
  }



  async getRestaurantWithMenus(id: string) {
    return this.restaurantRepository.find({
      relations: ['menuRestaurant', 'menuRestaurant.plats'],
    });
  }
  async deleteBlocFromRestaurant(restaurantId: string, blocId: string): Promise<void> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
      relations: [
        'restaurantBlocs',
        'restaurantBlocs.tables',
        'restaurantBlocs.tables.reservations',
        'restaurantBlocs.tables.reservations.reservationTime',
      ],
    });


    if (!restaurant) {
      throw new NotFoundException('Le restaurant est introuvable.');

    }

    const bloc = restaurant.restaurantBlocs.find(bloc => bloc.id === blocId);
    const blocToDelete = await this.restaurantBlocRepository.find({ where: { id: blocId } });

    if (!bloc) {
      throw new NotFoundException('Le bloc spécifié n’existe pas.');
    }

    const hasActiveReservations = bloc.tables.some(table =>
      table.reservations?.some(res => res.reservationTime?.isActive)
    );


    if (hasActiveReservations) {
      throw new BadRequestException('Impossible de supprimer ce bloc : des tables ont des réservations actives.');
    }

    await this.restaurantBlocRepository.delete(blocId);
    //restaurant.restaurantBlocs = restaurant.restaurantBlocs.filter(b => b.id !== blocId);
    //await this.restaurantRepository.save(restaurant);
  }

}
