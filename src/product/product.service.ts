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

    const category = await this.prisma.category.findUnique({
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
    return await this.prisma.product.findMany({
      where: { work_status: 'WORKING' },
      include: {
        category: {
          select: { id: true, name: true, name_uz: true, name_ru: true },
        },
        unit_type: true,
        items: {
          where: { work_status: 'WORKING' },
          include: {
            unit_type: true,
            _count: {
              select: { shop_products: { where: { work_status: 'WORKING' } } },
            },
          },
          orderBy: { id: 'desc' },
        },
        _count: { select: { items: { where: { work_status: 'WORKING' } } } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findByCategory(category_id: string | undefined) {
    this.logger.log('findByCategory');
    const cid = category_id ? parseInt(category_id, 10) : undefined;
    return await this.prisma.product.findMany({
      where: {
        work_status: 'WORKING',
        ...(cid !== undefined && !isNaN(cid) ? { category_id: cid } : {}),
      },
      include: {
        category: {
          select: { id: true, name: true, name_uz: true, name_ru: true },
        },
        unit_type: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    this.logger.log('findOne');

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, name_uz: true, name_ru: true },
        },
        unit_type: true,
        items: {
          where: { work_status: 'WORKING' },
          include: {
            unit_type: true,
            shop_products: {
              where: { work_status: 'WORKING' },
              include: {
                shop: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    lat: true,
                    lon: true,
                    image: true,
                  },
                },
              },
              orderBy: { price: 'asc' },
            },
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    return product;
  }

  async update(id: number, data: UpdateProductDto) {
    this.logger.log('update');
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    if (data.category_id) {
      const category = await this.prisma.category.findUnique({
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
    this.logger.log('remove (archive)');
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    return await this.prisma.product.update({
      where: { id },
      data: { work_status: 'DELETED' },
    });
  }
}
