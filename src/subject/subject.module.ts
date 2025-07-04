import { Module } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
// import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports:[
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, '..',"..", 'public','subjects'),
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          req.body.imgPath = `/static/subjects/${filename}`
          cb(null, filename);
        },
      }),
    }),
    
  ],
  controllers: [SubjectController],
  providers: [SubjectService],
})
export class SubjectModule {}
