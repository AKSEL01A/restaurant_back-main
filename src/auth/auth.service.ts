import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupDto } from './types/dtos/signup.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../user/entities/user.entity';
import { RoleUser } from './entities/role.entity';
import { LoginDto } from './types/dtos/login.dto';
import { MailService } from '../services/mail.service';


@Injectable()
export class AuthService {


  constructor(
    private readonly userService: UserService,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RoleUser)
    private readonly roleRepository: Repository<RoleUser>,
  ) { }


  async sendResetPasswordEmail(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000); // expire dans 1h

    // Save token & expiry in DB (ex: dans user.resetToken, user.resetTokenExpires)
    user.resetToken = token;
    user.resetTokenExpires = expires;
    await this.userService.save(user);

    const resetLink = `http://localhost:4200/auth/reset-password/${token}`;
    await this.mailService.sendMail({
      to: user.email,
      subject: 'Réinitialisation de mot de passe',
      text: `Cliquez <a href="${resetLink}">ici</a> pour réinitialiser votre mot de passe.`
    });
  }





  async signup(dto: SignupDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // const role = await this.roleRepository.findOneBy({ name: dto.role });
    // if (!role) throw new Error('Invalid role');


    const newUser = this.userRepository.create({
      email: dto.email,
      name: dto.name,
      lastname: dto.lastname,
      password: hashedPassword,
      phone: dto.phone,
      // role,
    });

    return this.userRepository.save(newUser);
  }

  async login(dto: LoginDto) {

    console.log("Tentative de connexion avec:", dto);

    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ['role'],
    });

    console.log("Utilisateur trouvé:", user);

    if (!user) {
      throw new UnauthorizedException("L'utilisateur n'existe pas");
    }


    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Mot de passe incorrect");
    }
    if (!user.role) {
      throw new UnauthorizedException("Aucun rôle assigné à cet utilisateur");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    console.log("Payload JWT envoyé:", payload);

    const token = this.jwtService.sign(payload);
    console.log("JWT généré:", token);

    /*le9dima**return { access_token: token };*/

    return {
    access_token: token,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role.name,
};



  }


  async generateToken(userId: string) {
    const payload = { sub: userId };
    const token = this.jwtService.sign(payload);
    console.log('JWT généré:', token);
    return { access_token: token };
  }


  async resetPassword(token: string, newPassword: string) {
    console.log('TOKEN:', token);
    const user = await this.userService.findByResetToken(token);
    console.log('USER:', user);
    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Lien invalide ou expiré');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await this.userService.save(user);
  }


  async changePassword(userId: string, oldPassword: string, newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException("Les mots de passe ne correspondent pas.");
    }
    console.log("Recherche utilisateur avec ID :", userId);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable !");
    }

    console.log("Utilisateur trouvé :", user.email);
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    console.log("Ancien mot de passe valide :", isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Ancien mot de passe incorrect");
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: "Mot de passe modifié avec succès" };
  }




}










