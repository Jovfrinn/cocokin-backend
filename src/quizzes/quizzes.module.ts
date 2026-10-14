import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

@Module({
  imports: [PrismaModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
