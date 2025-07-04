import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  
  import { Request } from 'express';
  import { Role } from '@prisma/client';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private jwtService: JwtService,
      @Inject() private prismaService: PrismaClientService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
  
      const payload : {
        role : Role,
        user_id : number
      } = await this.jwtService.verifyAsync(token);
     let where  = {   id: payload.user_id}
      let user: any;
      if (payload.role == Role.STUDENT) {
        user = await this.prismaService.student.findUnique({
          where
        });
      } else if (payload.role == Role.TEACHER) {
        user = await this.prismaService.teacher.findUnique({
          where
        });
      } else if (payload.role == Role.ADMIN) {
        user = await this.prismaService.admin.findUnique({
          where
        });
      } 
  
      if (!user) {
        throw new UnauthorizedException();
      }
     
  
      request['user'] = user;
  
      return true;
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }