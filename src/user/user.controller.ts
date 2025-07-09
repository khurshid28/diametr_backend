import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { editProfileUserDto } from './dto/edit-profile-user.dto';
import { UserService } from './user.service';
import { AuthGuard } from 'src/_guard/auth.guard';
import { RolesGuardFactory } from 'src/_guard/roles.guard';
import { Role } from '@prisma/client';

// @UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(RolesGuardFactory([Role.USER, Role.SUPER]))
  @Put('/edit-profile')
  @HttpCode(HttpStatus.OK)
  editProfile(@Body() data: editProfileUserDto, @Req() req) {
    return this.userService.editProfile(req, data);
  }

  @Get('/all')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
