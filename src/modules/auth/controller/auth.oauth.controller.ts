import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GithubAuthGuard, GoogleAuthGuard } from '@/common/guard/oauth.guard';
import { PublicRoute } from '@/common/guard/decorator';
import { UserOauthDto } from '../dtos/request';
import { Request, Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('auth/')
export class OauthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/google')
  @PublicRoute()
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('/google/callback')
  @PublicRoute()
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req['user'] as UserOauthDto;
    const redirectUrl = await this.validateOauth(user);
    return res.redirect(302, redirectUrl);
  }

  @Get('/github')
  @PublicRoute()
  @UseGuards(GithubAuthGuard)
  async githubAuth() {}

  @Get('/github/callback')
  @PublicRoute()
  @UseGuards(GithubAuthGuard)
  async githubAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req['user'] as UserOauthDto;
    const redirectUrl = await this.validateOauth(user);
    return res.redirect(302, redirectUrl);
  }

  private async validateOauth(user: UserOauthDto): Promise<string> {
    const { accessToken } = await this.authService.validateOAuthLogin(user);
    return `${process.env.FRONTEND_URL}?accessToken=${accessToken}`;
  }
}
