import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('Product service');
  async create(data: CreateProductDto) {
    this.logger.log('create');

    let category = await this.prisma.category.findUnique({
      where: { id: data.category_id },
    });

    if (!category) {
      throw new NotFoundException('category not found');
    }
    return await this.prisma.product.create({
      data: data,
    });
  }

  async findAll() {
    this.logger.log('findAll');
    const products = await this.prisma.product.findMany();
    return products;
  }
  async findOne(id: number) {
    this.logger.log('findOne');
    let product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    return product;
  }

  async update(id: number, data: UpdateProductDto) {
    this.logger.log('update');
    let product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    if (data.category_id) {
      let category = await this.prisma.category.findUnique({
        where: { id: data.category_id },
      });

      if (!category) {
        throw new NotFoundException('category not found');
      }
    }

    return await this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    this.logger.log('remove');
    let product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    return await this.prisma.product.delete({
      where: { id },
    });
  }
}
