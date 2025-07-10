import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppLoggerMiddleware } from './_middlewares/logger-handler';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaClientModule } from './_prisma_client/prisma_client.module';
import { ConfigModule } from '@nestjs/config';
import { RegionModule } from './region/region.module';
import { ShopModule } from './shop/shop.module';
import { NewModule } from './new/new.module';
import { AdminModule } from './admin/admin.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { ServiceModule } from './service/service.module';
import { WorkerModule } from './worker/worker.module';
import { PaymentModule } from './payment/payment.module';
import { SmsModule } from './sms/sms.module';
import { UserModule } from './user/user.module';
import { AdModule } from './ad/ad.module';
import { OrderModule } from './order/order.module';
import { ShopProductModule } from './shop-product/shop-product.module';
import { ProductItemModule } from './product-item/product-item.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath :".env"
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES },
    }),
   

    AuthModule,
    PrismaClientModule,
    RegionModule,
    ShopModule,
    NewModule,
    AdminModule,
    CategoryModule,
    ProductModule,
    ServiceModule,
    WorkerModule,
    PaymentModule,
    SmsModule,
    UserModule,
    AdModule,
    OrderModule,
    ShopProductModule,
    ProductItemModule

  ],
  controllers: [AppController],
  providers: [AppService, ],
})


export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
