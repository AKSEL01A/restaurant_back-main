import { Controller, Post, Param, UseGuards, Body, Get, Put, Delete, ParseUUIDPipe, Patch, ParseIntPipe, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateUserDto } from './types/dtos/create.user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './types/dtos/update.user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DataSource } from 'typeorm';

@ApiTags('users')
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly dataSource: DataSource
  ) { }

@Get('count-clients')
@Roles('admin')
async countClients(): Promise<number> {
  const result = await this.dataSource.query(`
    SELECT COUNT(*)::int AS total
    FROM "user"
    JOIN "role_user" ON "user"."roleId" = "role_user"."id"
    WHERE "role_user"."name" = 'customer'
  `);
  return result[0].total;
}

  @Post(':userId/assign-role/:roleName')
  @UseGuards(RolesGuard)
  @Roles('admin')
  assignRole(@Param('userId') userId: string, @Param('roleName') roleName: string) {
    return this.userService.assignRoleToUser(userId, roleName);
  }
  @Get('clients')
   @Roles('admin','manager')
findAllClients() {
  return this.userService.findByRole('customer');
}
   @Get('clients-with-restaurants')
  getClientsWithRestaurants() {
    return this.userService.getClientsWithRestaurants();
  }
  @Post('create')
  @Roles('admin')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get(':id')
  @Roles('admin', 'customer', 'serveur', 'manager')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
  @Get()
  @Roles('admin')
  async getUser() {
    return this.userService.getUser();
  }


  
@Delete(':id/force-delete')
  @Roles('admin', 'customer', 'serveur', 'manager')// ✅ Seul le client peut accéder à cette route
async deleteUserWithReservations(@Param('id') id: string) {
  console.log("🧨 Suppression demandée par un client");
  await this.userService.deleteUserAndCancelReservations(id);
  return { message: 'Utilisateur supprimé et réservations annulées' };
}


  
  @Patch(':id')
  @Roles('admin', 'customer', 'serveur', 'manager')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() request: any) {
    return this.userService.updateUser(id, updateUserDto, request);
  }

  @Delete(':id')
  @Roles('admin', 'customer', 'serveur', 'manager')
  async deleteUser(@Param('id', ParseIntPipe) id: string) {
    console.log("Tentative de suppression de l'utilisateur avec ID:", id);
    return this.userService.deleteUser(id);
  }




}
