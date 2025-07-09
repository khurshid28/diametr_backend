import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsSendDto } from './dto/sms-send.dto';
import { SmsVerifyDto } from './dto/sms-verify.dto';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('/send')
  @HttpCode(HttpStatus.OK)
  send(@Body() data: SmsSendDto) {
    return this.smsService.send(data);
  }

  @Post('/verify')
  @HttpCode(HttpStatus.OK)
  verify(@Body() data: SmsVerifyDto) {
    return this.smsService.verify(data);
  }
}
