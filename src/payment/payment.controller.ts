import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payment')
export class PaymentController {


    constructor(private readonly paymentService: PaymentService) {}
    
      @Post()
      create(@Body() createAdminDto: CreatePaymentDto) {
        return this.paymentService.create(createAdminDto);
      }
    
      @Get('/all')
      findAll() {
        return this.paymentService.findAll();
      }
    
      @Get(':id')
      findOne(@Param('id') id: string) {
        return this.paymentService.findOne(id);
      }
    
      @Put(':id')
      update(@Param('id') id: string, @Body() data: UpdatePaymentDto) {
        return this.paymentService.update(id, data);
      }
    
      @Delete(':id')
      remove(@Param('id') id: string) {
        return this.paymentService.remove(id);
      }
}
