import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';

@Injectable()
export class PromoCodeService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('PromoCodeService');

  async create(data: CreatePromoCodeDto) {
    this.logger.log('create');
    return this.prisma.promoCode.create({
      data: {
        code: data.code,
        discount: data.discount,
        expires_at: data.expires_at ? new Date(data.expires_at) : null,
      },
    });
  }

  async findAll() {
    this.logger.log('findAll');
    return this.prisma.promoCode.findMany({
      include: { _count: { select: { uses: true } } },
      orderBy: { id: 'desc' },
    });
  }

  async remove(id: number) {
    this.logger.log('remove');
    const promo = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promo code not found');
    return this.prisma.promoCode.delete({ where: { id } });
  }

  async toggle(id: number) {
    this.logger.log('toggle');
    const promo = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promo code not found');
    return this.prisma.promoCode.update({
      where: { id },
      data: { is_active: !promo.is_active },
    });
  }

  /**
   * Validate a promo code for a given user.
   * Returns the promo code record or throws BadRequestException.
   */
  async validate(code: string, userId: number) {
    this.logger.log(`validate: ${code} for user ${userId}`);

    const promo = await this.prisma.promoCode.findUnique({
      where: { code },
      include: {
        uses: { where: { user_id: userId } },
      },
    });

    if (!promo) {
      throw new BadRequestException('Promokod topilmadi');
    }

    if (!promo.is_active) {
      throw new BadRequestException('Promokod faol emas');
    }

    if (promo.expires_at && promo.expires_at < new Date()) {
      throw new BadRequestException('Promokod muddati tugagan');
    }

    if (promo.uses.length > 0) {
      throw new BadRequestException(
        'Bu promokod siz tomonidan allaqachon ishlatilgan',
      );
    }

    return { id: promo.id, code: promo.code, discount: promo.discount };
  }
}
