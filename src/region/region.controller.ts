import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Controller('region')
export class RegionController {

  constructor(private readonly regionService: RegionService) {}
     @Post()
      create(@Body() data: CreateRegionDto) {
        return this.regionService.create(data);
      }
    
      @Get("/all")
      findAll() {
        return this.regionService.findAll();
      }
    
      @Get(':id')
      findOne(@Param('id') id: string) {
        return this.regionService.findOne(+id);
      }
    
      @Put(':id')
      update(@Param('id') id: string, @Body() data: UpdateRegionDto) {
        return this.regionService.update(+id, data);
      }
    
      @Delete(':id')
      remove(@Param('id') id: string) {
        return this.regionService.remove(+id);
      }
}
