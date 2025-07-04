import { Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@Module({
  imports:[
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, '..',"..", 'public','sections'),
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          req.body.imgPath = `/static/sections/${filename}`
          cb(null, filename);
        },
      }),
    }),
    
  ],
  controllers: [SectionController],
  providers: [SectionService],
})
export class SectionModule {}
