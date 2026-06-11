import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { AuthUser } from '@/common/guard/decorator';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiEndpoint } from '@/common/doc/decorators/doc.api-endpoint.decorator';
import { UserResponseDto } from '../dtos/responses/user.response.dto';

@ApiTags('Users')
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @ApiEndpoint({
    summary: 'Get user profile',
    serialization: UserResponseDto,
    httpStatus: HttpStatus.OK,
    messageKey: 'user.profile.fetched',
  })
  async getMe(@AuthUser() authUser: IAuthUser) {
    return this.userService.getProfile(authUser);
  }
}
