import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { SmsSendDto } from './dto/sms-send.dto';
import { SmsVerifyDto } from './dto/sms-verify.dto';
import { generatePassword } from 'src/_utils/number.gen';
import { addMinutes, isBefore } from 'date-fns';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SmsService {
  constructor(
    private readonly prisma: PrismaClientService,
    private jwtService: JwtService,
  ) {}
  private logger = new Logger('Sms service');
  async send(data: SmsSendDto) {
    this.logger.log('send');

    // let code = generatePassword({ length: 6 });
    let code = '666666';

    try {
      let verify = await this.prisma.verify.create({
        data: {
          phone: data.phone,
          code,
          expired: addMinutes(new Date(), 5),
        },
      });
      return {
        id: verify.id,
        phone: data.phone,
      };
    } catch (e: any) {
      this.logger.error('verify.create error', e?.message);
      throw new InternalServerErrorException(
        'SMS yuborishda xatolik yuz berdi. Keyinroq qayta urinib ko\'ring.',
      );
    }
  }

  async verify(data: SmsVerifyDto) {
    this.logger.log('verify');

    let verify: any;
    try {
      verify = await this.prisma.verify.findUnique({ where: { id: data.id } });
    } catch (e: any) {
      this.logger.error('verify.findUnique error', e?.message);
      throw new InternalServerErrorException(
        'Serverda xatolik yuz berdi. Qayta urinib ko\'ring.',
      );
    }

    if (!verify) {
      throw new NotFoundException('Tasdiqlash kodi topilmadi. Qayta SMS oling.');
    }

    if (isBefore(verify.expired, new Date())) {
      throw new BadRequestException(
        'Kod muddati tugagan (5 daqiqa). Yangi kod oling.',
      );
    }

    if (verify.used) {
      throw new BadRequestException(
        'Bu kod allaqachon ishlatilgan. Yangi SMS oling.',
      );
    }

    if (verify.code !== data.code) {
      throw new BadRequestException("Kod noto'g'ri. Qayta tekshiring.");
    }

    try {
      await this.prisma.verify.update({
        where: { id: data.id },
        data: { used: true },
      });

      let user = await this.prisma.user.findUnique({
        where: { phone: verify.phone },
      });
      if (!user) {
        user = await this.prisma.user.create({
          data: { phone: verify.phone },
        });
      }

      const payload = { user_id: user.id, role: user.role };
      return {
        user,
        access_token: await this.jwtService.signAsync(payload),
        message: 'Verified successfully',
      };
    } catch (e: any) {
      this.logger.error('verify update/user error', e?.message);
      throw new InternalServerErrorException(
        'Serverda xatolik yuz berdi. Qayta urinib ko\'ring.',
      );
    }
  }
}
