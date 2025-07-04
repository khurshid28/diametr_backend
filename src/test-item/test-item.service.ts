import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTestItemDto } from './dto/create-test-item.dto';
import { UpdateTestItemDto } from './dto/update-test-item.dto';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';

@Injectable()
export class TestItemService {
  constructor(private readonly prisma: PrismaClientService) {}
  private logger = new Logger('Test-item service');
  async create(data: CreateTestItemDto) {
    this.logger.log('create');

    let test = await this.prisma.test.findUnique({
      where: { id : data.test_id, },
      select : {
        test_items : true
      }
    });
    data.number = test.test_items.length  + 1;
    if (!test) {
      throw new NotFoundException("Test not found");
    }
    const testItem = await this.prisma.testItem.create({
      data ,
    });
    return testItem;
  }

 async findAll(test_id : string | undefined) {
    this.logger.log('findAll');
    console.log(test_id);
    
    const testItems = await this.prisma.testItem.findMany({where : {test_id :  parseInt(`${test_id}`) },});
    return  testItems;
  }


  
  findOne(id: number) {
    return `This action returns a #${id} testItem`;
  }

  update(id: number, updateTestItemDto: UpdateTestItemDto) {
    return `This action updates a #${id} testItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} testItem`;
  }
}
