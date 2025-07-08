import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Controller('shop')
export class ShopController {

     constructor(private readonly shopService: ShopService) {}
         @Post()
          create(@Body() data: CreateShopDto) {
            return this.shopService.create(data);
          }
        
          @Get("/all")
          findAll() {
            return this.shopService.findAll();
          }
        
          @Get(':id')
          findOne(@Param('id') id: string) {
            return this.shopService.findOne(+id);
          }
        
          @Put(':id')
          update(@Param('id') id: string, @Body() data: UpdateShopDto) {
            return this.shopService.update(+id, data);
          }
        
          @Delete(':id')
          remove(@Param('id') id: string) {
            return this.shopService.remove(+id);
          }
}
