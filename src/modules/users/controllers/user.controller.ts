import { Body, Controller, Get, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { AuthUser } from '@/common/guard/decorator';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiEndpoint } from '@/common/doc/decorators/doc.api-endpoint.decorator';
import { UserResponseDto } from '../dtos/responses/user.response.dto';
import { ChangePasswordDto, UpdateUserDto } from '../dtos/requests/update-user.request.dto';

@ApiTags('Users')
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) { }

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

  @Post('/change-password')
  @ApiEndpoint({
    summary: 'Change user password',
    httpStatus: HttpStatus.OK,
    messageKey: 'user.password.changed',
  })
  async changePassword(@AuthUser() authUser: IAuthUser, @Body() payload: ChangePasswordDto) {
    return this.userService.changePassword(payload, authUser);
  }


  @Patch('/update-profile')
  @ApiEndpoint({
    summary: 'Update user profile',
    httpStatus: HttpStatus.OK,
    messageKey: 'user.profile.updated',
  })
  async updateProfile(@AuthUser() authUser: IAuthUser, @Body() payload: UpdateUserDto
  ) {
    return this.userService.updateProfile(payload, authUser);
  }

}
