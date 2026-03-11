import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { SmsSendDto } from './dto/sms-send.dto';
import { SmsVerifyDto } from './dto/sms-verify.dto';

@ApiTags('Auth')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SMS yuborish (telefon raqamga OTP)' })
  send(@Body() data: SmsSendDto, @Headers('accept-language') lang: string) {
    return this.smsService.send(data, lang);
  }

  @Post('/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SMS kodni tekshirish va foydalanuvchini ro’yxatdan o’tkazish' })
  verify(@Body() data: SmsVerifyDto, @Headers('accept-language') lang: string) {
    return this.smsService.verify(data, lang);
  }
}
