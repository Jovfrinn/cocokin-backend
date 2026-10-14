import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: any,
    @Body()
    body: {
      title: string;
      description: string;
      questions: { text: string; rating: number }[];
    },
  ) {
    const userId = req.user.userId;
    return this.quizzesService.create(
      userId,
      body.title,
      body.description,
      body.questions,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async findMyQuizzes(@Req() req: any) {
    const userId = req.user.userId;
    return this.quizzesService.findCreatorQuizzes(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/submissions')
  async getSubmissions(@Param('id') id: string) {
    return this.quizzesService.findSubmissions(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Post(':id/submit')
  async submit(
    @Param('id') id: string,
    @Req() req: any,
    @Body()
    body: { name: string; answers: { questionId: string; value: number }[] },
  ) {
    const ipHeader = req.headers['x-forwarded-for'];
    const ip =
      typeof ipHeader === 'string'
        ? ipHeader.split(',')[0].trim()
        : req.socket.remoteAddress || '';
    return this.quizzesService.submit(id, body.name, body.answers, ip);
  }
}
