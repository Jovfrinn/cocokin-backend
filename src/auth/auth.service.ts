import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }
    return user;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      full_name: user.full_name,
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        username: user.username,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}
