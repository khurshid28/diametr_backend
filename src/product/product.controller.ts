import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Mahsulot yaratish' })
  create(@Body() data: CreateProductDto) {
    return this.productService.create(data);
  }

  @Get('/all')
  @ApiOperation({ summary: "Barcha mahsulotlar ro'yxati" })
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta mahsulot' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Get('')
  @ApiOperation({ summary: "Kategoriya bo'yicha mahsulotlar" })
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  findByCategory(@Query('category_id') category_id: string | undefined) {
    return this.productService.findByCategory(category_id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mahsulotni tahrirlash' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productService.update(+id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Mahsulotni o'chirish" })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
