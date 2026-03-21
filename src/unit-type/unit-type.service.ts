import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { CreateUnitTypeDto } from './dto/create-unit-type.dto';

@Injectable()
export class UnitTypeService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('UnitTypeService');

  async create(data: CreateUnitTypeDto) {
    this.logger.log('create');
    return this.prisma.unitType.create({ data });
  }

  async findAll() {
    this.logger.log('findAll');
    return this.prisma.unitType.findMany({ orderBy: { id: 'asc' } });
  }

  async update(id: number, data: Partial<CreateUnitTypeDto>) {
    this.logger.log('update');
    const unit = await this.prisma.unitType.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException('UnitType not found');
    return this.prisma.unitType.update({ where: { id }, data });
  }

  async remove(id: number) {
    this.logger.log('remove');
    const unit = await this.prisma.unitType.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException('UnitType not found');
    return this.prisma.unitType.delete({ where: { id } });
  }
}
