import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Post()
  create(@Body() data: CreateProductDto) {
    return this.productService.create(data);
  }

  @Get('/all')
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  
  ) {
    return this.productService.findOne(+id);
  }


   @Get('')
   findByCategory(
   
    @Query('category_id') category_id: string | undefined,
  ) {
    return this.productService.findByCategory(category_id);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
