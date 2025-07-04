import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { generatePassword } from 'src/_utils/number.gen';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('Admin service');
  async create(data: CreateAdminDto) {
    this.logger.log('create');
    let student = await this.prisma.admin.findUnique({
      where: { phone: data.phone },
    });
    if (student) {
      throw new BadRequestException('This phone is used');
    }
    let password = generatePassword({
      length: 8,
    });
    data.password = password;
    student = await this.prisma.admin.create({
      data: data,
    });
    return student;
  }

  async findAll() {
    this.logger.log('findAll');
    const admins = await this.prisma.admin.findMany();
    return admins;
  }
  async findOne(id: number) {
    this.logger.log('findOne');
    let admin = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

 async update(id: number, data: UpdateAdminDto) {
  this.logger.log('update');
    let admin = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return await this.prisma.admin.update({
      where : {id},
      data
    });
  }

  async remove(id: number) {
    this.logger.log('remove');
    let admin = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return await this.prisma.admin.delete({
      where : {id}
    });
  }
}
