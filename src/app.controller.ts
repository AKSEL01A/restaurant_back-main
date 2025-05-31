import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { Roles } from './auth/decorators/roles.decorator';
import { RolesGuard } from './auth/guards/roles.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private userService: UserService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
}
