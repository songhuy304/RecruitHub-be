import { UserEntity } from '@/common/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { CompanyMemberDto } from '../dtos/response/company.get.response.dto';

export class MemberMapper {
  static toResponse(user: UserEntity): CompanyMemberDto {
    return plainToInstance(CompanyMemberDto, user, {
      excludeExtraneousValues: true,
    });
  }
  static toResponses(users: UserEntity[]): CompanyMemberDto[] {
    return users.map((user) => this.toResponse(user));
  }
}
