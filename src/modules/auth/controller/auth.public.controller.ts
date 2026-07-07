import { ApiEndpoint } from '@/common/doc/decorators/doc.api-endpoint.decorator';
import { AuthUser, PublicRoute } from '@/common/guard/decorator';
import { JwtRefreshGuard } from '@/common/guard/jwt.refresh.guard';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  ResetPasswordDto,
  SignupDto,
} from '../dtos/request';
import { AuthRefreshResponseDto, LoginResponseDto } from '../dtos/response';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthPublicController {
  constructor(private readonly authService: AuthService) { }

  @PublicRoute()
  @Post('/login')
  @ApiEndpoint({
    summary: 'User login',
    serialization: LoginResponseDto,
    messageKey: 'auth.success.loggedIn',
  })
  public async login(
    @Body() payload: LoginDto,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    return this.authService.login(payload);
  }

  @PublicRoute()
  @Post('/signup')
  public async signup(
    @Body() payload: SignupDto,
  ): Promise<ApiGenericResponseDto> {
    return this.authService.signup(payload);
  }

  @ApiBearerAuth('accessToken')
  @Delete('/logout')
  public async logout(
    @AuthUser() payload: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    return this.authService.logout(payload);
  }

  @ApiBearerAuth('refreshToken')
  @ApiOperation({ summary: 'Refresh token' })
  @Post('refresh-token')
  @PublicRoute()
  @UseGuards(JwtRefreshGuard)
  public refreshTokens(
    @AuthUser() user: IAuthUser,
    @Body() payload: RefreshDto,
  ): Promise<AuthRefreshResponseDto> {
    return this.authService.refreshTokens(user, payload);
  }

  @PublicRoute()
  @Post('/forgot-password')
  public async forgotPassword(
    @Body() payload: ForgotPasswordDto,
  ): Promise<ApiGenericResponseDto> {
    return this.authService.forgotPassword(payload);
  }

  @PublicRoute()
  @Post('/reset-password')
  public async resetPassword(
    @Body() payload: ResetPasswordDto,
  ): Promise<ApiGenericResponseDto> {
    return this.authService.resetPassword(payload);
  }
}
