import { PublicRoute } from '@/common/guard/decorator';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto, SignupDto } from '../dtos/request';
import { LoginResponseDto } from '../dtos/response';
import { AuthService } from '../services/auth.service';
import { AuthUser } from '@/common/guard/decorator';

@ApiTags('Auth')
@Controller()
export class AuthPublicController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Post('/login')
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
}
