/* eslint-disable no-unused-vars */
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) authService) {
    this.authService = authService;
  }

  @Post('login')
  async login(@Body() body) {
    // Body: { email, password }
    return this.authService.login(body?.email, body?.password);
  }
}
