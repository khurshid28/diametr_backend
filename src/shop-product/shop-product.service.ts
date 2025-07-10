import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { CreateShopProductDto } from './dto/create-shop-product.dto';
import { UpdateShopProductDto } from './dto/update-shop-product.dto';

@Injectable()
export class ShopProductService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('ShopProduct service');
  async create(data: CreateShopProductDto, req: Request) {
    this.logger.log('create');

    let productItem = await this.prisma.productItem.findUnique({
      where: { id: data.product_item_id },
    });
    if (!productItem) {
      throw new NotFoundException('productItem not found');
    }

    let admin = req['user'];

    return await this.prisma.shopProduct.create({
      data: {
        ...data,
        shop_id: admin.shop_id,
      },
    });
  }

  async findAll() {
    this.logger.log('findAll');
    const shopProducts = await this.prisma.shopProduct.findMany();
    return shopProducts;
  }
  async findOne(id: number) {
    this.logger.log('findOne');
    let shopProduct = await this.prisma.shopProduct.findUnique({
      where: { id },
    });
    if (!shopProduct) {
      throw new NotFoundException('shopProduct not found');
    }

    return shopProduct;
  }

  async update(id: number, data: UpdateShopProductDto) {
    this.logger.log('update');
    if (data.product_item_id) {
      let productItem = await this.prisma.productItem.findUnique({
        where: { id: data.product_item_id },
      });
      if (!productItem) {
        throw new NotFoundException('productItem not found');
      }
    }

    return await this.prisma.shopProduct.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    this.logger.log('remove');
    let shopProduct = await this.prisma.shopProduct.findUnique({
      where: { id },
    });
    if (!shopProduct) {
      throw new NotFoundException('shopProduct not found');
    }

    return await this.prisma.shopProduct.delete({
      where: { id },
    });
  }
}
