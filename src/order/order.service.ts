import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_STATUS } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('Order service');
  async create(data: CreateOrderDto) {
    this.logger.log('create');
    let shop = await this.prisma.shop.findUnique({
      where: { id: data.shop_id },
    });
    if (!shop) {
      throw new NotFoundException('shop not found');
    }

    let order = await this.prisma.$transaction(async (tx) => {
      let order = await tx.order.create({
        data: {
          shop_id: data.shop_id,
          amount: data.amount,
          lat: data.lat,
          lon: data.amount,
          delivery_type: data.delivery_type,
        },
      });

      await Promise.all(
        data.products
          .map((item) => {
            return { ...item, order_id: order.id };
          })
          .map(async (e) => {
            let shopProduct = await tx.shopProduct.findUnique({
              where: {
                id: e.shop_product_id,
              },
              include: {
                product_item: {
                  include: {
                    product: true,
                  },
                },
              },
            });

            if (!shopProduct) {
              throw new NotFoundException(
                `shopProduct not found by id #${e.shop_product_id}`,
              );
            } else if (e.count > shopProduct.count) {
              throw new BadRequestException(
                `Product isnot enough not #${shopProduct.product_item.product.name} ,${shopProduct.product_item.name}  - ${e.count}x`,
              );
            }

            await tx.orderProduct.create({
              data: {
                ...e,
                amount: shopProduct.price,
              },
            });
          }),
      );

      return order;
    });

    return await this.prisma.order.findUnique({
      where: { id: order.id },
      include: {
        shop: true,
        products: {
          include: {
            shop_product: {
              include: {
                product_item: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    this.logger.log('findAll');
    const orders = await this.prisma.order.findMany({
      include: {
        shop: true,
        products: {
          include: {
            shop_product: {
              include: {
                product_item: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return orders;
  }
  async findOne(id: number) {
    this.logger.log('findOne');
    let order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        shop: true,
        products: {
          include: {
            shop_product: {
              include: {
                product_item: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException('order not found');
    }

    return order;
  }

  async remove(id: number) {
    this.logger.log('remove');
    let order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('order not found');
    }

    return await this.prisma.order.delete({
      where: { id },
    });
  }

  async finish(id: number) {
    this.logger.log('finish');

    let order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
    if (!order) {
      throw new NotFoundException('order not found');
    }

    if (order.status == 'CANCELED') {
      throw new BadRequestException('order is canceled');
    } else if (order.status == 'FINISHED') {
      throw new BadRequestException('order is already finished');
    } else if (order.status == 'CONFIRMED') {
      throw new BadRequestException('order is already confirmed');
    }

    return await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        order.products.map(async (e) => {
          let shopProduct = await tx.shopProduct.findUnique({
            where: {
              id: e.shop_product_id,
            },
            include: {
              product_item: {
                include: {
                  product: true,
                },
              },
            },
          });

          if (!shopProduct) {
            throw new NotFoundException(
              `shopProduct not found by id #${e.shop_product_id}`,
            );
          } else if (e.count > shopProduct.count) {
            throw new BadRequestException(
              `Product isnot enough not #${shopProduct.product_item.product.name} ,${shopProduct.product_item.name}  - ${e.count}x`,
            );
          }

          await tx.shopProduct.update({
            where: {
              id: e.shop_product_id,
            },
            data: {
              count: shopProduct.count - e.count,
            },
          });
        }),
      );

      return await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: ORDER_STATUS.FINISHED,
        },
      });
    });
  }
  async confirm(id: number) {
    this.logger.log('finish');

    let order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('order not found');
    }

    if (order.status == 'CANCELED') {
      throw new BadRequestException('order is canceled');
    } else if (order.status == 'STARTED') {
      throw new BadRequestException('order is not finished');
    } else if (order.status == 'CONFIRMED') {
      throw new BadRequestException('order is already confirmed');
    }
    return await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: ORDER_STATUS.CONFIRMED,
      },
    });
  }
  async cancel(id: number) {
    this.logger.log('confirm');

    let order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('order not found');
    }

    if (order.status == 'CANCELED') {
      throw new BadRequestException('order is already canceled');
    }
    return await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: ORDER_STATUS.CANCELED,
      },
    });
  }
}
