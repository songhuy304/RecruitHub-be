import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GoogleAuthGuard } from '@/common/guard/google.guard';
import { PublicRoute } from '@/common/guard/decorator';
import { UserOauthDto } from '../dtos/request';
import { Request, Response } from 'express';

@Controller('auth/google')
export class GoogleController {
  constructor(private readonly authService: AuthService) {}

  @Get('/')
  @PublicRoute()
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('/callback')
  @PublicRoute()
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req['user'] as UserOauthDto;

    const { accessToken } = await this.authService.validateOAuthLogin(user);
    const redirectUrl = `${process.env.FRONTEND_URL}?accessToken=${accessToken}`;
    return res.redirect(302, redirectUrl);
  }
}
