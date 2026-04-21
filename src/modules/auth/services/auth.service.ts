import { ERROR_USER } from '@/common/constants';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@/common/filters/exception';
import { HelperEncryptionService } from '@/common/helper/services/helper.encryption.service';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { UserEntity } from '@/modules/users/entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto, SignupDto, UserOauthDto } from '../dtos/request';
import {
  AuthRefreshResponseDto,
  LoginResponseDto,
  OauthResponseDto,
} from '../dtos/response';
import { IAuthService } from '../interfaces/auth.service.interface';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly helperEncryptionService: HelperEncryptionService,
  ) {}

  public async login(
    data: LoginDto,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const user = await this.userRepository.findOneBy({
      userName: data.userName,
    });

    if (!user) {
      throw new NotFoundException(ERROR_USER.NOT_FOUND);
    }

    const isMatch = await this.helperEncryptionService.match(
      user.password,
      data.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(ERROR_USER.INVALID_CREDENTIALS);
    }

    const tokens = await this.helperEncryptionService.createJwtTokens({
      role: user.role,
      userId: user.id,
    });

    const refreshHash = await this.helperEncryptionService.createHash(
      tokens.refreshToken,
    );

    await this.userRepository.update(user.id, { refreshToken: refreshHash });

    return ApiResponseDto.success(tokens);
  }

  public async signup(payload: SignupDto): Promise<ApiGenericResponseDto> {
    const { email, password } = payload;

    const user = await this.userRepository.findOneBy({ email });

    if (user) throw new BadRequestException(ERROR_USER.ALREADY_EXISTS);

    const hashPassword =
      await this.helperEncryptionService.createHash(password);

    const newUser = this.userRepository.create({
      ...payload,
      password: hashPassword,
    });
    await this.userRepository.save(newUser);

    return ApiGenericResponseDto.success('register success');
  }

  public async logout(payload: IAuthUser): Promise<ApiGenericResponseDto> {
    await this.userRepository.update(payload.userId, { refreshToken: null });
    return ApiGenericResponseDto.success();
  }

  public async refreshTokens(
    payload: IAuthUser,
    refreshToken: string,
  ): Promise<AuthRefreshResponseDto> {
    const user = await this.userRepository.findOneBy({ id: payload.userId });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException(ERROR_USER.FORBIDDEN);
    }

    const isMatch = await this.helperEncryptionService.match(
      user.refreshToken,
      refreshToken,
    );

    if (!isMatch) {
      throw new UnauthorizedException(ERROR_USER.INVALID_CREDENTIALS);
    }

    const tokenPayload: IAuthUser = {
      userId: payload.userId,
      role: payload.role,
    };

    const tokens =
      await this.helperEncryptionService.createJwtTokens(tokenPayload);

    const refreshHash = await this.helperEncryptionService.createHash(
      tokens.refreshToken,
    );

    await this.userRepository.update(user.id, { refreshToken: refreshHash });

    return tokens;
  }

  public async validateOAuthLogin(
    payload: UserOauthDto,
  ): Promise<OauthResponseDto> {
    let user = await this.userRepository.findOneBy({ email: payload.email });

    if (!user) {
      user = await this.createOAuthUser(payload);
    }

    const tokens = await this.helperEncryptionService.createJwtTokens({
      userId: user.id,
      role: user.role,
    });

    const refreshHash = await this.helperEncryptionService.createHash(
      tokens.refreshToken,
    );

    await this.userRepository.update(user.id, { refreshToken: refreshHash });

    return tokens;
  }

  private async createOAuthUser(payload: UserOauthDto): Promise<UserEntity> {
    try {
      const newUser = this.userRepository.create({
        email: payload.email,
        fullName: payload.fullName,
        avatar: payload.avatar || null,
        provider: payload.provider,
        userName: payload.email,
        isVerified: true,
      });

      return await this.userRepository.save(newUser);
    } catch (error) {
      this.logger.error('Error creating OAuth user', error);
      throw new BadRequestException(
        `Failed to create OAuth user: ${error.message}`,
      );
    }
  }
}
