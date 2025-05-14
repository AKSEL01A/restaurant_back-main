import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector, private jwtService: JwtService) { }

//   canActivate(context: ExecutionContext): boolean {
//Bch njibou l’roles li talbinha l'endpoint.
// const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
//Si l’endpoint maytalbch rôle spécifique, kol chay masmou7
// if (!requiredRoles) return true;
//requette http
// const request = context.switchToHttp().getRequest();
//Yjib JWT token men header Authorization (Format: Bearer <TOKEN>).
// const token = request.headers.authorization?.split(' ')[1];

// if (!token) throw new ForbiddenException('Token missing');

// const user = this.jwtService.verify(token);

// return requiredRoles.includes(user.role);

// return user.role.some((role) => requiredRole.includes(role));
//Yverifi est-ce que l'utilisateur 3andou au moins 1 rôle men roles li talbha l’endpoint
//   }
// }















@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ForbiddenException('Authorization header missing');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new ForbiddenException('Invalid Authorization header');
    }

    const user = this.jwtService.verify(token);
    console.log('🟢 Rôle utilisateur trouvé:', user.role);
    console.log('🟢 Rôles requis pour accéder:', requiredRoles);

    return requiredRoles.includes(user.role);
  }
}

