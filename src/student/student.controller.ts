import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Put } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AuthGuard } from 'src/_guard/auth.guard';
import { AdminGuard } from 'src/_guard/admin.guard';


@UseGuards(AuthGuard)
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get("/all")
  @UseGuards(AdminGuard)
  findAll() {
    return this.studentService.findAll();
  }
  @Get("/rate")
  rate(@Req()  req :Request) {
    return this.studentService.rate(req);
  }


  @UseGuards(AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.studentService.remove(+id);
  }
}
