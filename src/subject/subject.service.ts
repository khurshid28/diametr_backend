import { Injectable, Logger } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { fileURLToPath } from 'url';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('Subject service');
  async create(data: CreateSubjectDto) {
    this.logger.log('create');
    const subject = await this.prisma.subject.create({
      data : {
        name : data.name,
        image : data.imgPath
      },
    });
    return subject;
  }

 async findAll() {
    this.logger.log('findAll');
    const subjects = await this.prisma.subject.findMany();
    return  subjects;
  }



  findOne(id: number) {
    return `This action returns a #${id} subject`;
  }

  update(id: number, updateSubjectDto: UpdateSubjectDto) {
    return `This action updates a #${id} subject`;
  }

  remove(id: number) {
    return `This action removes a #${id} subject`;
  }
}
