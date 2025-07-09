import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { Request } from 'express';

export function RolesGuardFactory(roles: Role[]): any {
  @Injectable()
  class DynamicRolesGuard implements CanActivate {
    constructor(
      private jwtService: JwtService,
      private prisma: PrismaClientService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) throw new UnauthorizedException();

      const payload: { role: Role; user_id: number } =
        await this.jwtService.verifyAsync(token);

      const isAllowed = roles.includes(payload.role);
      if (!isAllowed) throw new UnauthorizedException('Access denied');

      const user = await this.prisma[payload.role.toLowerCase()].findUnique({
        where: { id: payload.user_id },
      });

      if (!user) throw new UnauthorizedException(`${payload.role.toLowerCase()} not found`);

      request['user'] = user;
      return true;
    }
  }

  return DynamicRolesGuard;
}
