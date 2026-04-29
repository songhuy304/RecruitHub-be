import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { AuthUser } from '@/common/guard/decorator';
import { IAuthUser } from '@/common/request/interfaces';

@ApiTags('Users')
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  async getMe(@AuthUser() authUser: IAuthUser) {
    return this.userService.getProfile(authUser);
  }
}
