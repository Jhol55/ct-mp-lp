/* eslint-disable no-unused-vars */
import {
  CanActivate,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(JwtService) jwt,
    @Inject(ConfigService) config,
  ) {
    this.jwt = jwt;
    this.config = config;
  }

  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization ?? '';
    const [type, token] = String(authHeader).split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const secret = this.config.get('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    let payload;
    try {
      payload = await this.jwt.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (payload?.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin required');
    }

    request.user = payload;
    return true;
  }
}

