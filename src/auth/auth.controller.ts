import { Controller, Post, Body, UseGuards, Request, Get, Param, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { SignupDto } from './types/dtos/signup.dto';
import { LoginDto } from './types/dtos/login.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { ResetPasswordDto } from './types/dtos/reset-password.dto';
import { ChangePasswordDto } from './types/dtos/change-password.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,

  ) { }
  @UseGuards(JwtAuthGuard)
  @Get('test-token')
  testToken(@Request() req) {
    return req.user;
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    console.log('Données reçues pour inscription:', dto);
    return this.authService.signup(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:email')
  async getUserByEmail(@Param('email') email: string) {
    console.log('Requête reçue pour email:', email);
    return this.userService.findByEmail(email);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendResetPasswordEmail(email);
  }


  @Post('reset-password')
  async resetPassword(@Body() Dto: ResetPasswordDto) {
    return this.authService.resetPassword(Dto.resetToken, Dto.newPassword);
  }



  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
      changePasswordDto.confirmPassword);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return req.user;
  }


}








