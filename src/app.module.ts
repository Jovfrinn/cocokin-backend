import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { QuizzesController } from './quizzes/quizzes.controller';
import { QuizzesService } from './quizzes/quizzes.service';
import { QuizzesModule } from './quizzes/quizzes.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, QuizzesModule],
  controllers: [AppController, QuizzesController],
  providers: [AppService, QuizzesService],
})
export class AppModule {}
