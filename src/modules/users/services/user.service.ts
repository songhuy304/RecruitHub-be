import { ApiResponseDto } from '@/common/response';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { IUserService } from '../interfaces/user.service.interface';
import { UserMapper } from '../mappers/user.mapper';
import { IAuthUser } from '@/common/request/interfaces';
import { UserResponseDto } from '../dtos/responses/user.response.dto';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepositoryImpl) {}

  async getProfile(
    payload: IAuthUser,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.userRepository.findById(payload.userId);
    const data = UserMapper.toResponse(user);
    return ApiResponseDto.success(data);
  }
}
