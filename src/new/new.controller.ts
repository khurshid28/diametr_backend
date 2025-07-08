import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { NewService } from './new.service';
import { CreateNewDto } from './dto/create-new.dto';
import { UpdateNewDto } from './dto/update-new.dto';

@Controller('new')
export class NewController {

     constructor(private readonly newService: NewService) {}
         @Post()
          create(@Body() data: CreateNewDto) {
            return this.newService.create(data);
          }
        
          @Get("/all")
          findAll() {
            return this.newService.findAll();
          }
        
          @Get(':id')
          findOne(@Param('id') id: string) {
            return this.newService.findOne(+id);
          }
        
          @Put(':id')
          update(@Param('id') id: string, @Body() data: UpdateNewDto) {
            return this.newService.update(+id, data);
          }
        
          @Delete(':id')
          remove(@Param('id') id: string) {
            return this.newService.remove(+id);
          }
}
