import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('Category service');
  async create(data: CreateCategoryDto) {
    this.logger.log('create');

    return await this.prisma.category.create({
      data: data,
    });
  }

  async findAll() {
    this.logger.log('findAll');
    const categories = await this.prisma.category.findMany();
    return categories;
  }
  async findOne(id: number) {
    this.logger.log('findOne');
    let category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('category not found');
    }

    return category;
  }

  async update(id: number, data: UpdateCategoryDto) {
    this.logger.log('update');
    let category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('category not found');
    }

    return await this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    this.logger.log('remove');
    let category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('category not found');
    }

    return await this.prisma.category.delete({
      where: { id },
    });
  }
}
