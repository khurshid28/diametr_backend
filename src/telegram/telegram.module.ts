import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { PrismaClientModule } from 'src/_prisma_client/prisma_client.module';

@Module({
  imports: [PrismaClientModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
