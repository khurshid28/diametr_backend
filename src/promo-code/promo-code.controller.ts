import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PromoCodeService } from './promo-code.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { Role } from '@prisma/client';
import { RolesGuardFactory } from 'src/_guard/roles.guard';

@ApiTags('Promo-Code')
@ApiBearerAuth('JWT')
@Controller('promo-code')
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  /** Admin: create a new promo code */
  @Post()
  @UseGuards(RolesGuardFactory([Role.ADMIN]))
  @ApiOperation({ summary: 'Promo kod yaratish (ADMIN)' })
  create(@Body() dto: CreatePromoCodeDto) {
    return this.promoCodeService.create(dto);
  }

  /** Admin: list all promo codes */
  @Get('/all')
  @UseGuards(RolesGuardFactory([Role.ADMIN]))
  @ApiOperation({ summary: 'Barcha promo kodlar (ADMIN)' })
  findAll() {
    return this.promoCodeService.findAll();
  }

  /** User: validate a promo code before order */
  @Get('/validate/:code')
  @UseGuards(RolesGuardFactory([Role.USER]))
  @ApiOperation({ summary: 'Promo kodni tekshirish (USER)' })
  @ApiParam({ name: 'code', type: String, example: 'SALE20' })
  validate(@Param('code') code: string, @Request() req: any) {
    return this.promoCodeService.validate(code.toUpperCase(), req['user'].id);
  }

  /** Admin: toggle active/inactive */
  @Patch('/toggle/:id')
  @UseGuards(RolesGuardFactory([Role.ADMIN]))
  @ApiOperation({ summary: 'Promo kodni yoqish/o’chirish (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  toggle(@Param('id') id: string) {
    return this.promoCodeService.toggle(+id);
  }

  /** Admin: delete */
  @Delete('/:id')
  @UseGuards(RolesGuardFactory([Role.ADMIN]))
  @ApiOperation({ summary: 'Promo kodni o’chirish (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.promoCodeService.remove(+id);
  }
}
