import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { generatePassword } from 'src/_utils/number.gen';
import { Result, Role } from '@prisma/client';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('Student service');
  async create(data: CreateStudentDto) {
    this.logger.log('create');
    let student = await this.prisma.student.findUnique({
      where: { phone: data.phone },
    });
    if (student) {
      throw new BadRequestException('This phone is used');
    }
    let password = generatePassword({
      length: 8,
    });
    data.password = password;
    student = await this.prisma.student.create({
      data: data,
    });
    return student;
  }

  async findAll() {
    this.logger.log('findAll');
    const students = await this.prisma.student.findMany();
    return students;
  }

  async rate(req: Request) {
    this.logger.log('rate');
    let user: {
      role: Role | undefined;
      id: number | undefined;
    } = req['user'];

    let student = await this.prisma.student.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    let students = await this.prisma.student.findMany({
      where: { group_id: student.group_id },
      include: {
        results: {
          select: {
            id: true,
            solved: true,
            test: {
              select: {
                section: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                
                id: true,
                name: true,
                _count: {
                  select: {
                    test_items: true,
                  },
                },
              },
            },
            createdt: true,
          },
        },
      },
    });
    
    return students;
  }

  async findOne(id: number) {
    this.logger.log('findOne');
    let student = await this.prisma.student.findUnique({
      where: { id },
    });
    if (!student) {
      throw new NotFoundException('Admin not found');
    }

    return student;
  }

 async update(id: number, data: UpdateStudentDto) {
  this.logger.log('update');
    let student = await this.prisma.student.findUnique({
      where: { id },
    });
    if (!student) {
      throw new NotFoundException('Admin not found');
    }

    return await this.prisma.student.update({
      where : {id},
      data
    });
  }

  async remove(id: number) {
    this.logger.log('remove');
    let student = await this.prisma.student.findUnique({
      where: { id },
    });
    if (!student) {
      throw new NotFoundException('Admin not found');
    }

    return await this.prisma.student.delete({
      where : {id}
    });
  }
}
