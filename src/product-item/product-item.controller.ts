import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProductItemService } from './product-item.service';
import { CreateProductItemDto } from './dto/create-product-item.dto';
import { UpdateProductItemDto } from './dto/update-product-item.dto';

@ApiTags('Product-Item')
@Controller('product-item')
export class ProductItemController {
  constructor(private readonly productItemService: ProductItemService) {}

  @Post()
  @ApiOperation({ summary: 'Mahsulot varianti yaratish' })
  create(@Body() data: CreateProductItemDto) {
    return this.productItemService.create(data);
  }

  @Get('/all')
  @ApiOperation({ summary: 'Barcha mahsulot variantlari' })
  findAll() {
    return this.productItemService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta mahsulot varianti' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id') id: string) {
    return this.productItemService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mahsulot variantini tahrirlash' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id') id: string, @Body() data: UpdateProductItemDto) {
    return this.productItemService.update(+id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Mahsulot variantini o’chirish' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.productItemService.remove(+id);
  }
}
