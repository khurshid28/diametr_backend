import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ShopProductService } from './shop-product.service';
import { CreateShopProductDto } from './dto/create-shop-product.dto';
import { UpdateShopProductDto } from './dto/update-shop-product.dto';
import { Role } from '@prisma/client';
import { RolesGuardFactory } from 'src/_guard/roles.guard';

@ApiTags('Shop-Product')
@Controller('shop-product')
export class ShopProductController {
  constructor(private readonly shopProductService: ShopProductService) {}

  @Post()
  @UseGuards(RolesGuardFactory([Role.ADMIN, Role.SUPER]))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Do\'konga mahsulot qo\'shish (ADMIN/SUPER)' })
  create(@Body() data: CreateShopProductDto, @Req() req) {
    return this.shopProductService.create(data, req);
  }

  @Get('/all')
  @ApiOperation({ summary: 'Barcha do’kon mahsulotlari ro’yxati' })
  findAll() {
    return this.shopProductService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta do’kon mahsuloti' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id') id: string) {
    return this.shopProductService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Do’kon mahsulotini tahrirlash' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id') id: string, @Body() data: UpdateShopProductDto) {
    return this.shopProductService.update(+id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Do’kon mahsulotini o’chirish' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.shopProductService.remove(+id);
  }
}
