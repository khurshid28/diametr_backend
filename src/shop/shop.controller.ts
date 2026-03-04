import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@ApiTags('Shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @ApiOperation({ summary: 'Do’kon yaratish' })
  create(@Body() data: CreateShopDto) {
    return this.shopService.create(data);
  }

  @Get('/all')
  @ApiOperation({ summary: 'Barcha do’konlar ro’yxati' })
  findAll() {
    return this.shopService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta do’kon' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id') id: string) {
    return this.shopService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Do’konni tahrirlash' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id') id: string, @Body() data: UpdateShopDto) {
    return this.shopService.update(+id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Do’konni o’chirish' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.shopService.remove(+id);
  }
}
