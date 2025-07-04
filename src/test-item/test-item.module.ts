import { Module } from '@nestjs/common';
import { TestItemService } from './test-item.service';
import { TestItemController } from './test-item.controller';

@Module({
  controllers: [TestItemController],
  providers: [TestItemService],
})
export class TestItemModule {}
