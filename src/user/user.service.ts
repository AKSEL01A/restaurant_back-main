import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoleRepository } from 'src/auth/repositories/role.repository';
import { CreateUserDto } from './types/dtos/create.user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './types/dtos/update.user.dto';
import { UserRepository } from './repositories/user.repository';
import { RoleUser } from 'src/auth/entities/role.entity';
import { User } from './entities/user.entity';
import { ReservationTable } from 'src/reservations/entities/reservation.entity';
import { ReservationRepository } from 'src/reservations/repositories/reservation.repository';
import { MoreThan, Repository } from 'typeorm';
 import { ReservationStatus } from 'src/reservations/enums/reservation.enums'; // assure-toi de bien importer ça
import { MailService } from 'src/services/mail.service';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RoleUser)
    private readonly roleRepository: Repository<RoleUser>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(ReservationTable)

    private readonly reservationRepository: Repository<ReservationTable>,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,


  ) { }
  public generateRandomPassword(length = 8): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const rnum = Math.floor(Math.random() * chars.length);
      password += chars[rnum];
    }
    return password;
  }

  async countUsers(): Promise<number> {
    const result = await this.dataSource.query('SELECT COUNT(*)::int AS total Users FROM "user"');
    return result[0].Total;
  }

  async findByEmail(email: string) {
    console.log('Recherche de l\'utilisateur avec email :', email);
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    return user;
  }
  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { resetToken: token } });
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
  async assignRoleToUser(userId: string, roleName: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    const role = await this.roleRepository.findOneBy({ name: roleName });

    if (!user || !role) {
      throw new Error('User or Role not found');
    }

    user.role = (role);
    return this.userRepository.save(user);
  }


  async createUser(createUserDto: CreateUserDto) {
    console.log('➡️ Payload reçu:', createUserDto);
    const { email, name, lastname, role, phone, dateDebutContrat, restaurantId } = createUserDto;

    try {
      const existingUser = await this.userRepository.findOneBy({ email });
      if (existingUser) {
        throw new BadRequestException('Cet utilisateur existe déjà.');
      }

      if (role === 'admin') {
        throw new BadRequestException("Un admin ne peut pas créer un autre admin.");
      }
      const password = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      let roleEntity = await this.roleRepository.findOneBy({ name: role });
      if (!roleEntity) {
        roleEntity = this.roleRepository.create({ name: role });
        await this.roleRepository.save(roleEntity);
      }
      let restaurant: Restaurant | null = null;
      if (restaurantId) {
        restaurant = await this.restaurantRepository.findOneBy({ id: restaurantId });
        if (!restaurant) {
          throw new BadRequestException("Restaurant introuvable");
        }
      }
      const newUser = this.userRepository.create({
        email,
        name,
        lastname,
        phone,
        dateDebutContrat: dateDebutContrat ? new Date(dateDebutContrat) : undefined,
        password: hashedPassword,
        role: roleEntity,
 restaurant: restaurant || undefined,      });

      const savedUser = await this.userRepository.save(newUser);


      await this.mailService.sendUserWelcomeEmail(email, {
        name,
        password,
      });

      return savedUser;

    } catch (err) {
      console.error("❌ Erreur lors de la création de l'utilisateur:", err);
      throw new BadRequestException("Erreur serveur lors de la création de l'utilisateur.");
    }
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    console.log("🚀 Utilisateur renvoyé :", user);
    return user;
  }

  async findById(id: string) {
  return this.userRepository.findOne({
    where: { id },
    relations: ['role', 'restaurant'],
  });
}


  async getUser() {
    return this.userRepository.find();
  }
  // async updateUser(id: string, updateUserDto: UpdateUserDto) {
  //   const user = await this.userRepository.findOneBy({ id });

  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${id} not found`);
  //   }
  //   const role = await this.roleRepository.findOneBy({ name: updateUserDto.role });
  //   if (!role) {
  //     throw new NotFoundException(`Role ${updateUserDto.role} non trouvé`);
  //   }

  //   if (updateUserDto.role && !['manager', 'serveur'].includes(updateUserDto.role)) {
  //     throw new BadRequestException("Seuls les rôles 'manager' et 'serveur' peuvent être assignés.");
  //   }

  //   Object.assign(user, updateUserDto);
  //   user.role = role;
  //   return await this.userRepository.save(user);
  // }




async deleteUserAndCancelReservations(userId: string): Promise<void> {
  const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: ['reservations'],
  });

  if (!user) {
    throw new NotFoundException("Utilisateur introuvable");
  }

  const today = new Date().toISOString().split('T')[0];

  const futureReservations = await this.reservationRepository
    .createQueryBuilder('reservation')
    .leftJoinAndSelect('reservation.reservationTime', 'reservationTime')
    .leftJoin('reservation.user', 'user')
    .where('user.id = :userId', { userId })
    .andWhere('reservation.isCancelled = false')
    .andWhere('reservationTime.date2 > :today', { today })
    .getMany();

  for (const reservation of futureReservations) {
    reservation.isCancelled = true;
    reservation.status = ReservationStatus.CANCELLED;
    await this.reservationRepository.save(reservation);
  }

  await this.userRepository.delete(userId);
}


















  async updateUser(id: string, updateUserDto: UpdateUserDto, request: any) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const currentUser = request.user;

    if (updateUserDto.role && updateUserDto.role !== user.role.name) {
      if (currentUser.role !== 'admin') {
        throw new ForbiddenException("Seul un administrateur peut modifier le rôle d'un utilisateur.");
      }

      if (!['manager', 'serveur'].includes(updateUserDto.role)) {
        throw new BadRequestException("Seuls les rôles 'manager' et 'serveur' peuvent être assignés.");
      }

      const newRole = await this.roleRepository.findOneBy({ name: updateUserDto.role });
      if (!newRole) {
        throw new NotFoundException(`Role ${updateUserDto.role} non trouvé`);
      }

      user.role = newRole;
    }

    // ✅ Traiter le restaurant
    if (updateUserDto.restaurantId) {
      const restaurant = await this.restaurantRepository.findOneBy({ id: updateUserDto.restaurantId });
      if (!restaurant) {
        throw new NotFoundException(`Restaurant avec l'ID ${updateUserDto.restaurantId} non trouvé`);
      }
      user.restaurant = restaurant;
    }
    delete updateUserDto.role;
    delete updateUserDto.restaurantId;

    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }



  async deleteUser(id: string) {
    console.log("ID reçu pour suppression:", id);

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      console.log("Utilisateur introuvable !");
      throw new NotFoundException(`L'utilisateur avec l'ID ${id} n'existe pas`);
    }

    const now = new Date();

    // Vérifie uniquement les réservations futures
    const futureReservations = await this.reservationRepository.find({
      where: {
        user: { id },
        reservationTime: {
          date2: MoreThan(now),
        },
      },
      relations: ['reservationTime'],
    });

    if (futureReservations.length > 0) {
      throw new BadRequestException("Impossible de supprimer l'utilisateur : il a des réservations à venir.");
    }

    // 🔥 Si arrivé ici, il a zéro résa future → suppression autorisée
    await this.userRepository.delete(id);
    return { message: 'Utilisateur supprimé avec succès.' };
  }
  async findByRole(roleName: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        role: {
          name: roleName,
        }
      },
      relations: ['role'], // 👈 important pour que `role.name` soit chargé
    });
  }

}

