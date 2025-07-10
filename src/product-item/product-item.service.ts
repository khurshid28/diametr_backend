import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { CreateProductItemDto } from './dto/create-product-item.dto';
import { UpdateProductItemDto } from './dto/update-product-item.dto';
@Injectable()
export class ProductItemService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('ProductItem service');
  async create(data: CreateProductItemDto) {
    this.logger.log('create');

    let product = await this.prisma.product.findUnique({
      where: {
        id: data.product_id,
      },
    });

    if (!product) {
      throw new NotFoundException('product not found');
    }

    return await this.prisma.productItem.create({
      data: data,
    });
  }

  async findAll() {
    this.logger.log('findAll');
    const productItems = await this.prisma.productItem.findMany();
    return productItems;
  }
  async findOne(id: number) {
    this.logger.log('findOne');
    let productItem = await this.prisma.productItem.findUnique({
      where: { id },
    });
    if (!productItem) {
      throw new NotFoundException('productItem not found');
    }

    return productItem;
  }

  async update(id: number, data: UpdateProductItemDto) {
    this.logger.log('update');
    let productItem = await this.prisma.productItem.findUnique({
      where: { id },
    });
    if (!productItem) {
      throw new NotFoundException('productItem not found');
    }
    if (data.product_id) {
      let product = await this.prisma.product.findUnique({
        where: {
          id: data.product_id,
        },
      });
      if (!product) {
        throw new NotFoundException('product not found');
      }
    }

    return await this.prisma.productItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    this.logger.log('remove');
    let productItem = await this.prisma.productItem.findUnique({
      where: { id },
    });
    if (!productItem) {
      throw new NotFoundException('productItem not found');
    }

    return await this.prisma.productItem.delete({
      where: { id },
    });
  }
}
