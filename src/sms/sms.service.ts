import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
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

    // let code = generatePassword({
    //   length: 6,
    // });
    let code = '666666';

    let verify = await this.prisma.verify.create({
      data: {
        phone: data.phone,
        code,
        expired: addMinutes(new Date(), 2),
      },
    });
    return {
      id: verify.id,
      phone: data.phone,
    };
  }

  async verify(data: SmsVerifyDto) {
    this.logger.log('verify');
    let verify = await this.prisma.verify.findUnique({
      where: {
        id: data.id,
      },
    });
    if (!verify) {
      throw new NotFoundException('not found');
    }

    if (isBefore(verify.expired, new Date())) {
      throw new BadRequestException('expired code');
    }
    if (verify.used) {
      throw new BadRequestException('code is already used');
    }

    if (verify.code !== data.code) {
      throw new BadRequestException("code don't match");
    }

    await this.prisma.verify.update({
      where: {
        id: data.id,
      },
      data: {
        used: true,
      },
    });

    let user = await this.prisma.user.findUnique({
      where: {
        phone: verify.phone,
      },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: verify.phone,
        },
      });
    }

    const payload = { user_id: user.id, role: user.role };
    return {
      user,
      access_token: await this.jwtService.signAsync(payload),
      message: 'Verified successfully',
    };
  }
}
