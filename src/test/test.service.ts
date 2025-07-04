import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { CreateSectionDto } from 'src/section/dto/create-section.dto';

@Injectable()
export class TestService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('Test service');
  async create(data: CreateTestDto) {
    this.logger.log('create');

    let section = await this.prisma.section.findUnique({
      where: { id: data.section_id },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }
    const test = await this.prisma.test.create({
      data: {
        name: data.name,
        section_id: data.section_id,
      },
    });
    return test;
  }

  async findAll() {
    this.logger.log('findAll');
    const tests = await this.prisma.test.findMany({
      include: {
        _count: {
          select: { test_items: true, results: true },
        },
      },
    });
    return tests;
  }

  async findOne(id: number) {
    this.logger.log('findOne');
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        section: true,
        test_items : true,
        _count: {
          select: { test_items: true, results: true },
        },
      },
    });
    return test;
  }

  update(id: number, updateTestDto: UpdateTestDto) {
    return `This action updates a #${id} test`;
  }

  remove(id: number) {
    return `This action removes a #${id} test`;
  }
}
