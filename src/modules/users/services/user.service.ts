import { ApiResponseDto } from '@/common/response';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserService } from '../interfaces/user.service.interface';
import { UserMapper } from '../mappers/user.mapper';
import { IAuthUser } from '@/common/request/interfaces';
import { UserResponseDto } from '../dtos/responses/user.response.dto';
import { ERROR_USER } from '@/common/constants';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepositoryImpl) {}

  async getProfile(
    payload: IAuthUser,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.userRepository.findByIdWithCurrentTeam(
      payload.userId,
    );

    if (!user) {
      throw new NotFoundException(ERROR_USER.NOT_FOUND);
    }
    const data = UserMapper.toResponse(user);
    return ApiResponseDto.success(data);
  }
}
