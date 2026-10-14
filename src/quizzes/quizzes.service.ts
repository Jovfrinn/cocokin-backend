import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    title: string,
    description: string,
    questions: { text: string; rating: number }[],
  ) {
    return this.prisma.quiz.create({
      data: {
        title,
        description:
          description ??
          'Kuis ini dibuat untuk menguji kesamaan frekuensi Anda dengan pasangan Anda',
        creatorId: userId,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            rating: q.rating,
          })),
        },
      },
      include: {
        questions: true,
      },
    });
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
        creator: {
          select: {
            full_name: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Kuis Tidak Ditemukan');
    }
    return quiz;
  }

  async findCreatorQuizzes(userId: number) {
    return this.prisma.quiz.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        submissions: true,
      },
    });
  }

  private calculateCosineSimilarity(
    vectorA: number[],
    vectorB: number[],
  ): number {
    let dotProduct = 0;
    let sumSqA = 0;
    let sumSqB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      sumSqA += vectorA[i] * vectorA[i];
      sumSqB += vectorB[i] * vectorB[i];
    }

    const magnitudeA = Math.sqrt(sumSqA);
    const magnitudeB = Math.sqrt(sumSqB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    const cosineScore = dotProduct / (magnitudeA * magnitudeB);

    return Math.round(cosineScore * 1000) / 10;
  }

  async getLocationFromIp(ip: string): Promise<string> {
    const cleanIp = ip.replace('::ffff:', ''); // Clean up IPv6-mapped IPv4 addresses
    if (
      !cleanIp ||
      cleanIp === '::1' ||
      cleanIp === '127.0.0.1' ||
      cleanIp.startsWith('192.168.') ||
      cleanIp.startsWith('10.') ||
      cleanIp.startsWith('172.16.') ||
      cleanIp.startsWith('172.31.')
    ) {
      return 'Localhost / Development';
    }
    try {
      const res = await fetch(`https://freeipapi.com/api/json/${cleanIp}`);
      const data = await res.json();
      if (data && data.cityName && data.countryName) {
        return `${data.cityName}, ${data.countryName}`;
      }
      return 'Unknown Location';
    } catch {
      return 'Unknown Location';
    }
  }

  async submit(
    quizId: string,
    name: string,
    answers: { questionId: string; value: number }[],
    ip?: string,
  ) {
    const quiz = await this.findOne(quizId);

    const vectorA = quiz.questions.map((q) => q.rating);

    const vectorB = quiz.questions.map((q) => {
      const ans = answers.find((a) => a.questionId === q.id);
      return ans ? ans.value : 3;
    });

    const score = this.calculateCosineSimilarity(vectorA, vectorB);
    const location = ip ? await this.getLocationFromIp(ip) : 'Unknown Location';

    return this.prisma.submission.create({
      data: {
        name,
        score,
        ip: ip || null,
        location,
        quizId,
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            value: a.value,
          })),
        },
      },
    });
  }

  async findSubmissions(quizId: string) {
    return this.prisma.submission.findMany({
      where: { quizId },
      orderBy: { score: 'desc' }, // Urutkan dari persentase kecocokan tertinggi
      include: {
        answers: true,
      },
    });
  }
}
