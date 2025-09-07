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
    // const products = await this.prisma.product.findMany();

        const products = await this.prisma.$queryRaw<
      Array<{ id: number; name: string; image: string; count: number }>
    >`
  SELECT p.id, p.name, p.image,
         COALESCE(SUM(op.count), 0) AS count
  FROM Product p
  LEFT JOIN ProductItem pi ON pi.product_id = p.id
  LEFT JOIN ShopProduct sp ON sp.product_item_id = pi.id
  LEFT JOIN OrderProduct op ON op.shop_product_id = sp.id
 
  GROUP BY p.id
`;
    return products;
  }

  async findByCategory(category_id: string | undefined) {
    this.logger.log('findByCategory');
    //   const products = await this.prisma.product.findMany({
    //     where : {
    //        category_id: parseInt(category_id.toString())
    //     },
    //    include: {
    //   items: {
    //     include: {
    //       shop_products: {
    //         include: {
    //           _count: {
    //             select: { order_products: true }, // har shopProduct uchun orderlar soni
    //           },
    //         },
    //       },
    //     },
    //   },
    // },
    //   });

    const products = await this.prisma.$queryRaw<
      Array<{ id: number; name: string; image: string; count: number }>
    >`
  SELECT p.id, p.name, p.image,
         COALESCE(SUM(op.count), 0) AS count
  FROM Product p
  LEFT JOIN ProductItem pi ON pi.product_id = p.id
  LEFT JOIN ShopProduct sp ON sp.product_item_id = pi.id
  LEFT JOIN OrderProduct op ON op.shop_product_id = sp.id
  WHERE p.category_id = ${category_id ? parseInt(category_id) : null}
  GROUP BY p.id
`;

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
