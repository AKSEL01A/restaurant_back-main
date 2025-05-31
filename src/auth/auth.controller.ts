import { Controller, Post, Body, UseGuards, Request, Get, Param, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { SignupDto } from './types/dtos/signup.dto';
import { LoginDto } from './types/dtos/login.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { ResetPasswordDto } from './types/dtos/reset-password.dto';
import { ChangePasswordDto } from './types/dtos/change-password.dto';
import { ApiTags } from '@nestjs/swagger';
import { VerifyOtpDto } from './types/dtos/VerifyOtpDto';


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
  @Post('verify-otp')
async verifyOtp(@Body() dto: VerifyOtpDto) {
  const user = await this.userService.findByEmail(dto.email);
  if (!user || user.resetToken !== dto.otp) {
    throw new BadRequestException('Code invalide');
  }

  if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    throw new BadRequestException('Code expiré');
  }

  // ✅ OTP valide : on peut autoriser le reset
  return { message: 'Code valide. Vous pouvez réinitialiser votre mot de passe.' };
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


  /*@Post('reset-password')
  async resetPassword(@Body() Dto: ResetPasswordDto) {
    return this.authService.resetPassword(Dto.resetToken, Dto.newPassword);
  }*/

    @Post('reset-password')
async resetPassword(@Body() dto: ResetPasswordDto) {
  return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
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
  console.log('📥 Requête /auth/me reçue pour user ID:', req.user.sub);

  const user = await this.userService.findById(req.user.sub);

  if (!user) {
    console.error('❌ Utilisateur introuvable avec ID:', req.user.sub);
    throw new UnauthorizedException('Utilisateur introuvable');
  }

  // 🛑 نحب كان اللي عندو rôle "serveur"
  if (user.role.name !== 'serveur') {
    console.warn('🚫 Accès refusé: rôle ≠ serveur →', user.role.name);
    throw new UnauthorizedException('Accès réservé aux serveurs uniquement');
  }

  // 👉 Log détaillé
  console.log("📦 User récupéré:", user);
  console.log("🏠 Restaurant lié:", user.restaurant);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role.name,
    restaurant: user.restaurant
      ? {
          id: user.restaurant.id,
          name: user.restaurant.name,
        }
      : null,
  };
}
 

}








