import {
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/login-dto';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    @Inject() private prisma: PrismaClientService,
    private jwtService: JwtService,
  ) {}
  private logger = new Logger('Auth service');

  async login(data: LoginDto) {
    this.logger.log('login');

    type userType =
      | Prisma.AdminWhereUniqueInput
      | Prisma.SuperWhereUniqueInput
      | Prisma.WorkerWhereUniqueInput;
    let where = { phone: '+' + data.login, password: data.password };

    let user: userType = await this.prisma.worker.findUnique({
      where,
    });

    if (!user) {
      user = await this.prisma.admin.findUnique({
        where,
      });
    }
    if (!user) {
      user = await this.prisma.super.findUnique({
        where,
      });
    }
    if (!user) {
      throw new NotFoundException('Incorrect Credentials');
    }

    const payload = { user_id: user.id, role: user.role };
    return {
      user,
      access_token: await this.jwtService.signAsync(payload),
      message: 'Logined successfully',
    };
  }
}
