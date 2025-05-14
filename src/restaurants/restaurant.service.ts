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
@Injectable()
export class RestaurantService {

  constructor
    (private readonly restaurantRepository: RestaurantRepository,
      @InjectRepository(RestaurantBloc)
      private readonly restaurantBlocRepository: Repository<RestaurantBloc>,

      @InjectRepository(Bloc)
      private readonly blocRepository: Repository<Bloc>,

      @InjectRepository(RestaurantImage)
      private restaurantImageRepository: Repository<RestaurantImage>,

    ) { }

  // async getRestaurantById(id: string) {
  //   const fetchedRestaurant = await this.restaurantRepository.findOne({
  //     where: { id },
  //     relations: ['restaurantBlocs', 'restaurantBlocs.bloc', 'images',]
  //   });


  //   if (!fetchedRestaurant) {
  //     throw new BadRequestException(`Restaurant with ID ${id} not found`);
  //   }

  //   if (fetchedRestaurant.hourly) {
  //     const [start, end] = fetchedRestaurant.hourly.split('-');
  //     const nowHour = new Date().getHours();

  //     const startHour = parseInt(start);
  //     const endHour = parseInt(end);

  //     const isOpen = nowHour >= startHour && nowHour < endHour;
  //     fetchedRestaurant.status = isOpen ? RestaurantStatus.OUVERT : RestaurantStatus.FERME;
  //   }

  //   return fetchedRestaurant;
  // }



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
          // pour les horaires de nuit (ex: 20-02)
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


    // modification
   /* const restaurants = await this.restaurantRepository.find({
      where,
      relations: ['restaurantBlocs', 'restaurantBlocs.bloc'],
    });*/


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
      const bloc = await this.blocRepository.findOneBy({ id: blocData.blocId });
      if (!bloc) {
        throw new NotFoundException(`Bloc avec ID ${blocData.blocId} introuvable`);
      }

      if (!blocData.maxTables) {
        throw new BadRequestException(`maxTables est requis pour le bloc ${bloc.id}`);
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




  async deleteRestaurant(id: string) {
    const restaurant = await this.restaurantRepository.findOneBy({ id });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    await this.restaurantRepository.delete(id);
    return { message: `Restaurant with ID ${id} deleted successfully` };
  }

  async updateRestaurant(id: string, updateRestaurantDto: UpdateRestaurantDto) {
    if (!Object.keys(updateRestaurantDto).length) {
      throw new BadRequestException("Aucune donnée à mettre à jour.");
    }

    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['restaurantBlocs'],
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant avec ID ${id} introuvable.`);
    }

    if (updateRestaurantDto.restaurantBlocs && updateRestaurantDto.restaurantBlocs.length > 0) {
      const blocsDto: RestaurantBloc[] = updateRestaurantDto.restaurantBlocs.map((blocDto) => {
        const blocEntity = new RestaurantBloc();

        blocEntity.bloc = { id: blocDto.blocId } as Bloc;


        blocEntity.maxTables = blocDto.maxTables;

        blocEntity.maxChaises = blocDto.maxChaises;


        blocEntity.restaurant = restaurant;


        blocEntity.tables = [];


        if ((blocDto as any).id) {
          blocEntity.id = (blocDto as any).id;
        }

        return blocEntity;
      });


      restaurant.restaurantBlocs = blocsDto;


      delete updateRestaurantDto.restaurantBlocs;
    }


    Object.assign(restaurant, updateRestaurantDto);


    return instanceToPlain(await this.restaurantRepository.save(restaurant));
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

}