import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // secretOrKey: configService.get<string>('JWT_SECRET') ||  'super_secret_key',
      secretOrKey: jwtConstants.secret,

    });
  }

  async validate(payload: any) {

    console.log("Payload JWT reçu :", payload);
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role
    };
  }
}
