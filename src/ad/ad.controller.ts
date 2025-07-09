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
import { AdService } from './ad.service';
import { UpdateAdDto } from './dto/update-ad-dto';
import { CreateAdDto } from './dto/create-ad-dto';

@Controller('ad')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Post()
  create(@Body() data: CreateAdDto) {
    return this.adService.create(data);
  }

  @Get('/all')
  findAll() {
    return this.adService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateAdDto) {
    return this.adService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adService.remove(+id);
  }
}
