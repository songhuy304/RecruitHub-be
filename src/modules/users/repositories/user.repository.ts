import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { UserEntity, TeamMemberEntity } from '@/common/entities';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { EAuthProvider } from '@/common/enums';

@Injectable()
export class UserRepositoryImpl extends IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    repo: TypeOrmRepository<UserEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }

  async findByEmailOrUsername(
    userName: string,
    provider?: EAuthProvider,
  ): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: [
        {
          userName,
          ...(provider && { provider }),
        },
        {
          email: userName,
          ...(provider && { provider }),
        },
      ],
    });
  }

  async findByEmail(
    email: string,
    provider: EAuthProvider = EAuthProvider.LOCAL,
  ): Promise<UserEntity | null> {
    return this.repo.findOneBy({ email, provider });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['teamMembers'],
    });
  }

  async existsTeam(teamId: number): Promise<boolean> {
    return this.repo.manager.exists(TeamMemberEntity, { where: { teamId } });
  }
}
