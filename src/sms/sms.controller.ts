import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpCode,
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
  send(@Body() data: SmsSendDto) {
    return this.smsService.send(data);
  }

  @Post('/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SMS kodni tekshirish va foydalanuvchini ro’yxatdan o’tkazish' })
  verify(@Body() data: SmsVerifyDto) {
    return this.smsService.verify(data);
  }
}
