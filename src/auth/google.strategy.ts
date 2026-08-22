import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from '../users/users.service';
import 'dotenv/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly usersService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails } = profile;
    const email = emails[0].value;
    const displayName = `${name.givenName || ''} ${name.familyName || ''}`.trim() || profile.displayName;

    // 1. Try to find user by Google ID
    let user = await this.usersService.findByGoogleId(id);

    // 2. If not found by Google ID, try to find by Email
    if (!user) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        // Link Google ID to existing account
        user = await this.usersService.update(user.id, { googleId: id } as any);
      } else {
        // 3. Create a new Google user
        user = await this.usersService.createGoogleUser({
          email,
          full_name: displayName,
          googleId: id,
        });
      }
    }

    done(null, user);
  }
}
