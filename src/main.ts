import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './_middlewares/error-handler';
import { join } from 'path';
import { ResponseLoggingInterceptor } from './_middlewares/reponse-logging-handler';

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger(),
    rawBody : true,
    bodyParser : true,
    
    
  });
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  app.setGlobalPrefix('/api/v1');


  app.useBodyParser('json', { limit: '20mb' });
  app.useBodyParser('urlencoded', { limit: '20mb', extended: true });
  app.useBodyParser('text',{ limit: '20mb', extended: true });


  app.useGlobalPipes(new ValidationPipe({
    transform : true
  }));
   app.useGlobalInterceptors(new ResponseLoggingInterceptor());


  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });
  
  // app.use(
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000, // 15 minutes
  //     max: 4000, // limit each IP to 100 requests per windowMs
  //   }),
  // );

  await app.listen(process.env.PORT ?? 8888);
}
main();
