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

const smsMessages = {
  uz: {
    smsSendError: "SMS yuborishda xatolik yuz berdi. Keyinroq qayta urinib ko'ring.",
    serverError: "Serverda xatolik yuz berdi. Qayta urinib ko'ring.",
    codeNotFound: 'Tasdiqlash kodi topilmadi. Qayta SMS oling.',
    codeExpired: 'Kod muddati tugagan (5 daqiqa). Yangi kod oling.',
    codeUsed: 'Bu kod allaqachon ishlatilgan. Yangi SMS oling.',
    codeWrong: "Kod noto'g'ri. Qayta tekshiring.",
  },
  ru: {
    smsSendError: 'Ошибка при отправке SMS. Попробуйте позже.',
    serverError: 'Ошибка сервера. Попробуйте ещё раз.',
    codeNotFound: 'Код подтверждения не найден. Получите новый SMS.',
    codeExpired: 'Срок действия кода истёк (5 минут). Получите новый код.',
    codeUsed: 'Этот код уже использован. Получите новый SMS.',
    codeWrong: 'Неверный код. Проверьте ещё раз.',
  },
};

function m(lang: string): typeof smsMessages.uz {
  return smsMessages[lang === 'ru' ? 'ru' : 'uz'];
}

@Injectable()
export class SmsService {
  constructor(
    private readonly prisma: PrismaClientService,
    private jwtService: JwtService,
  ) {}
  private logger = new Logger('Sms service');
  async send(data: SmsSendDto, lang = 'uz') {
    this.logger.log('send');

    // let code = generatePassword({ length: 6 });
    let code = '666666'; // test rejimi

    try {
      // Eski ishlatilmagan verifylarni bekor qilish
      await this.prisma.verify.updateMany({
        where: { phone: data.phone, used: false },
        data: { used: true },
      });

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
      throw new InternalServerErrorException(m(lang).smsSendError);
    }
  }

  async verify(data: SmsVerifyDto, lang = 'uz') {
    this.logger.log('verify');

    let verify: any;
    try {
      verify = await this.prisma.verify.findUnique({ where: { id: data.id } });
    } catch (e: any) {
      this.logger.error('verify.findUnique error', e?.message);
      throw new InternalServerErrorException(m(lang).serverError);
    }

    if (!verify) {
      throw new NotFoundException(m(lang).codeNotFound);
    }

    if (isBefore(verify.expired, new Date())) {
      throw new BadRequestException(m(lang).codeExpired);
    }

    if (verify.used) {
      throw new BadRequestException(m(lang).codeUsed);
    }

    if (verify.code !== data.code) {
      throw new BadRequestException(m(lang).codeWrong);
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

      // Save chat_id and lang if provided (store bot login)
      const updateData: { chat_id?: string; lang?: string } = {};
      if (data.chat_id) updateData.chat_id = data.chat_id;
      if (data.lang && ['uz', 'ru'].includes(data.lang)) updateData.lang = data.lang;
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
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
