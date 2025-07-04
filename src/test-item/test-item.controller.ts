import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { TestItemService } from './test-item.service';
import { CreateTestItemDto } from './dto/create-test-item.dto';
import { UpdateTestItemDto } from './dto/update-test-item.dto';
import { AuthGuard } from 'src/_guard/auth.guard';


@UseGuards(AuthGuard)
@Controller('test-item')
export class TestItemController {
  constructor(private readonly testItemService: TestItemService) {}

  @Post()
  create(
    @Body() createTestDto: CreateTestItemDto,
   
  ) {
    return this.testItemService.create(createTestDto);
  }

  @Get("/all")
  findAll(@Query("test_id") test_id :string | undefined ) {
    return this.testItemService.findAll(test_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testItemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestItemDto: UpdateTestItemDto) {
    return this.testItemService.update(+id, updateTestItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testItemService.remove(+id);
  }
}
