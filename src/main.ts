import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './_middlewares/error-handler';
import { join } from 'path';
import { ResponseLoggingInterceptor } from './_middlewares/reponse-logging-handler';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger(),
    rawBody: true,
    bodyParser: true,
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.setGlobalPrefix('/api/v1');

  app.useBodyParser('json', { limit: '20mb' });
  app.useBodyParser('urlencoded', { limit: '20mb', extended: true });
  app.useBodyParser('text', { limit: '20mb', extended: true });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ResponseLoggingInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });

  // ─── Swagger ─────────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Diametr API')
    .setDescription(
      `## Diametr backend REST API\n\n` +
      `**Base URL:** \`/api/v1\`\n\n` +
      `Barcha himoyalangan endpointlar uchun **Authorize** tugmasini bosing va ` +
      `\`Bearer <token>\` formatida JWT tokeningizni kiriting.`,
    )
    .setVersion('1.0.0')
    .setContact('Diametr', 'https://diametr.uz', 'admin@diametr.uz')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: "JWT tokenni kiriting (Bearer so'zsiz)",
        in: 'header',
      },
      'JWT',
    )
    .addTag('Auth',       'Kirish / chiqish')
    .addTag('User',       'Foydalanuvchilar')
    .addTag('Admin',      'Admin paneli')
    .addTag('Shop',       'Do\'konlar')
    .addTag('Product',    'Mahsulotlar')
    .addTag('Product-Item', 'Mahsulot variantlari')
    .addTag('Category',   'Kategoriyalar')
    .addTag('Order',      'Buyurtmalar')
    .addTag('Service',    'Xizmatlar')
    .addTag('Worker',     'Ustalar / ishchilar')
    .addTag('Ad',         'Reklamalar')
    .addTag('New',        'Yangiliklar')
    .addTag('Region',     'Hududlar')
    .addTag('Payment',    'To\'lovlar')
    .addTag('Promo-Code', 'Promo kodlar')
    .addTag('Shop-Product', 'Do\'kon mahsulotlari')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,          // sahifa yangilananda token saqlansin
      filter: true,                        // endpointlarni qidiruv
      displayRequestDuration: true,        // so'rov vaqti ko'rinsin
      docExpansion: 'none',                // default yopiq (chiroyliroq)
      defaultModelsExpandDepth: 2,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Diametr API Docs',
    customfavIcon: '/static/favicon.ico',
    customCss: `
      .swagger-ui .topbar { background: #1e293b; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #1e293b; font-size: 2rem; }
      .swagger-ui .btn.authorize { background: #2563eb; border-color: #2563eb; color: #fff; }
      .swagger-ui .btn.authorize:hover { background: #1d4ed8; }
    `,
  });
  // ─────────────────────────────────────────────────────────────────────────────

  const port = process.env.PORT ?? 8888;
  await app.listen(port);

  console.log(`\n🚀  Server running on   http://localhost:${port}/api/v1`);
  console.log(`📖  Swagger docs at     http://localhost:${port}/docs`);
  console.log(`📖  Swagger JSON at     http://localhost:${port}/docs-json\n`);
}
main();
