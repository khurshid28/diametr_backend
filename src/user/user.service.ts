import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { editProfileUserDto } from './dto/edit-profile-user.dto';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('User service');
  async editProfile(req: Request, data: editProfileUserDto) {
    this.logger.log('edit-profile');
    let user = req['user'];

    return await this.prisma.user.update({
      where: { id: user.id },
      data,
    });
  }

  async findAll() {
    this.logger.log('findAll');
    const users = await this.prisma.user.findMany();
    return users;
  }
  async findOne(id: number) {
    this.logger.log('findOne');
    let user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async remove(id: number) {
    this.logger.log('remove');
    let user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return await this.prisma.user.delete({
      where: { id },
    });
  }
}
