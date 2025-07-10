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
import { ProductItemService } from './product-item.service';
import { CreateProductItemDto } from './dto/create-product-item.dto';
import { UpdateProductItemDto } from './dto/update-product-item.dto';

@Controller('product-item')
export class ProductItemController {

    constructor(private readonly productItemService: ProductItemService) {}
    
      @Post()
      create(@Body() data: CreateProductItemDto) {
        return this.productItemService.create(data);
      }
    
      @Get('/all')
      findAll() {
        return this.productItemService.findAll();
      }
    
      @Get(':id')
      findOne(@Param('id') id: string) {
        return this.productItemService.findOne(+id);
      }
    
      @Put(':id')
      update(@Param('id') id: string, @Body() data: UpdateProductItemDto) {
        return this.productItemService.update(+id, data);
      }
    
      @Delete(':id')
      remove(@Param('id') id: string) {
        return this.productItemService.remove(+id);
      }
}
