import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { Role } from '@prisma/client';

@Injectable()
export class SectionService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('Section service');
  async create(data: CreateSectionDto) {
    this.logger.log('create');

    let book = await this.prisma.book.findUnique({
      where: { id : parseInt(data.book_id.toString())},
    });
    console.log(book);
    
    if (!book) {
      throw new NotFoundException("Book not found");
    }
    const section = await this.prisma.section.create({
      data : {
        name : data.name,
        book_id : book.id,
        image : data.imgPath
      },
    });
    return section;
  }

 async findAll(req :Request) {

    this.logger.log('findAll');
    this.logger.log('findOne');
    let user: {
      role: Role | undefined;
      id: number | undefined;
    } = req['user'];
    const sections = await this.prisma.section.findMany({
      include:{
        test : {
         
          include  :{
            results :  {
              where :{student_id : user.id }
            },
            _count: {
              select: { test_items: true, results : true },
            },
          }
        }
      }
    });
    return  sections;
  }
  async findOne(id: number,req :Request) {
    this.logger.log('findOne');
    let user: {
      role: Role | undefined;
      id: number | undefined;
    } = req['user'];
   
    
    let section = await this.prisma.section.findUnique({
      where: { id },
      include:{
        book :{
          include :{
            subject : true
          }
        },
        test : {
          
          include  :{
            _count: {
              select: { test_items: true, results : true },
            },
            results :  {
              where :{student_id : user.id }
            },
            
          }
        }
      }
    });
    if (!section) {
      throw new NotFoundException('section not found');
    }

    return section;
  }

  update(id: number, updateSectionDto: UpdateSectionDto) {
    return `This action updates a #${id} section`;
  }

  remove(id: number) {
    return `This action removes a #${id} section`;
  }
}
