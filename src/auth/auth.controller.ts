import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import * as express from 'express';
import 'dotenv/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: express.Response) {
    const result = await this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userParam = encodeURIComponent(JSON.stringify(result.user));
    const tokenParam = encodeURIComponent(result.access_token);
    return res.redirect(
      `${frontendUrl}/login?token=${tokenParam}&user=${userParam}`,
    );
  }
}
