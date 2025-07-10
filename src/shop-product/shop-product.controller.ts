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
  Req,
} from '@nestjs/common';
import { ShopProductService } from './shop-product.service';
import { CreateShopProductDto } from './dto/create-shop-product.dto';
import { UpdateShopProductDto } from './dto/update-shop-product.dto';
import { Role } from '@prisma/client';
import { RolesGuardFactory } from 'src/_guard/roles.guard';

@Controller('shop-product')
export class ShopProductController {


    constructor(private readonly shopProductService: ShopProductService) {}
    
      @Post()
      @UseGuards(RolesGuardFactory([Role.ADMIN]))
      create(@Body() data: CreateShopProductDto,@Req() req) {
        return this.shopProductService.create(data,req);
      }
    
      @Get('/all')
      findAll() {
        return this.shopProductService.findAll();
      }
    
      @Get(':id')
      findOne(@Param('id') id: string) {
        return this.shopProductService.findOne(+id);
      }
    
      @Put(':id')
      update(@Param('id') id: string, @Body() data: UpdateShopProductDto) {
        return this.shopProductService.update(+id, data);
      }
    
      @Delete(':id')
      remove(@Param('id') id: string) {
        return this.shopProductService.remove(+id);
      }
}
