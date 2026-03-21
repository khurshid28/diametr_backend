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

  async findAll(regions?: string) {
    this.logger.log('findAll');
    const regionIds = regions
      ? regions.split(',').map(Number).filter(Boolean)
      : null;
    const shops = await this.prisma.shop.findMany({
      where: {
        work_status: 'WORKING',
        ...(regionIds && regionIds.length > 0
          ? { region_id: { in: regionIds } }
          : {}),
      },
      include: { region: { select: { id: true, name: true } } },
    });
    return shops;
  }
  async findOne(id: number) {
    this.logger.log('findOne');
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        admins: true,
        products: {
          where: { work_status: 'WORKING' },
          include: {
            product_item: {
              include: {
                unit_type: true,
                product: {
                  select: {
                    id: true, name: true, name_uz: true, name_ru: true,
                    image: true, desc: true, category_id: true,
                    category: { select: { id: true, name: true, name_uz: true, name_ru: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!shop) throw new NotFoundException('shop not found');

    const products = shop.products
      .map((sp) => ({
        id: sp.product_item?.product?.id ?? sp.id,
        shop_product_id: sp.id,
        name: sp.product_item?.product?.name,
        name_uz: sp.product_item?.product?.name_uz,
        name_ru: sp.product_item?.product?.name_ru,
        image: sp.product_item?.product?.image,
        desc: sp.product_item?.product?.desc,
        price: sp.price,
        bonus_price: sp.bonus_price ?? null,
        count: sp.count,
        category_id: sp.product_item?.product?.category_id,
        category: sp.product_item?.product?.category,
        // Variant details
        product_item_id: sp.product_item_id,
        variant_name: sp.product_item?.name,
        variant_image: sp.product_item?.image,
        color: sp.product_item?.color ?? null,
        size: sp.product_item?.size ?? null,
        value: sp.product_item?.value ? Number(sp.product_item.value) : null,
        unit_type: sp.product_item?.unit_type ?? null,
      }))
      .filter((p) => p.name != null);

    return { ...shop, products };
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
