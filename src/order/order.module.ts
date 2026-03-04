import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PromoCodeModule } from 'src/promo-code/promo-code.module';

@Module({
  imports: [PromoCodeModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
