import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      },
    });
    if (existing) {
      throw new ConflictException(
        existing.email === createUserDto.email
          ? 'Email sudah terdaftar'
          : 'Username sudah dipakai',
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password || '',
      saltRounds,
    );

    const user = await this.prisma.user.create({
      data: {
        full_name: createUserDto.full_name,
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...result } = user;
        return result;
      }
    }
    return null;
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async createGoogleUser(data: {
    email: string;
    full_name: string;
    googleId: string;
  }) {
    const emailPrefix = data.email.split('@')[0];
    let username = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '');

    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) {
      username = `${username}_${Math.random().toString(36).substring(2, 6)}`;
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        full_name: data.full_name,
        username,
        googleId: data.googleId,
        password: null,
      },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
