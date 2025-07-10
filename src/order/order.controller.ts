import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Role } from '@prisma/client';
import { RolesGuardFactory } from 'src/_guard/roles.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/all')
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }

  @Post()
  @UseGuards(RolesGuardFactory([Role.USER]))
  create(@Body() data: CreateOrderDto) {
    return this.orderService.create(data);
  }

  @Put('/finish/:id')
  @UseGuards(RolesGuardFactory([Role.ADMIN]))
  finish(@Param('id') id: string) {
    return this.orderService.finish(+id);
  }

  @Put('/confirm/:id')
  @UseGuards(RolesGuardFactory([Role.USER]))
  confirm(@Param('id') id: string) {
    return this.orderService.confirm(+id);
  }

  @Put('/cancel/:id')
  @UseGuards(RolesGuardFactory([Role.ADMIN]))
  cancel(@Param('id') id: string) {
    return this.orderService.cancel(+id);
  }
}
