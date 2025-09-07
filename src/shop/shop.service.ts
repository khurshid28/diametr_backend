import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('Shop service');
  async create(data: CreateShopDto) {
    this.logger.log('create');

    let region = await this.prisma.region.findUnique({
      where: { id: data.region_id },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }
    return await this.prisma.shop.create({
      data: data,
    });
  }

  async findAll() {
    this.logger.log('findAll');
    const shops = await this.prisma.shop.findMany();
    return shops;
  }
  async findOne(id: number) {
    this.logger.log('findOne');
    let shop = await this.prisma.shop.findUnique({
      where: { id },
      include : {
        admins : true,
        products : true
      }
    });
    if (!shop) {
      throw new NotFoundException('shop not found');
    }

    return shop;
  }

  async update(id: number, data: UpdateShopDto) {
    this.logger.log('update');
    let shop = await this.prisma.shop.findUnique({
      where: { id },
    });
    if (!shop) {
      throw new NotFoundException('shop not found');
    }

    if (data.region_id) {
      let region = await this.prisma.region.findUnique({
        where: { id: data.region_id },
      });

      if (!region) {
        throw new NotFoundException('Region not found');
      }
    }

    return await this.prisma.shop.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    this.logger.log('remove');
    let shop = await this.prisma.shop.findUnique({
      where: { id },
    });
    if (!shop) {
      throw new NotFoundException('shop not found');
    }

    return await this.prisma.shop.delete({
      where: { id },
    });
  }
}
