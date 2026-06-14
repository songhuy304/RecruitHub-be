import { ERROR_AUTH, ERROR_USER } from '@/common/constants';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@/common/filters/exception';
import { HelperEncryptionService } from '@/common/helper/services/helper.encryption.service';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { UserEntity } from '@/common/entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  SignupDto,
  UserOauthDto,
} from '../dtos/request';
import {
  AuthRefreshResponseDto,
  LoginResponseDto,
  OauthResponseDto,
} from '../dtos/response';
import { IAuthService } from '../interfaces/auth.service.interface';
import { AuthMailService } from './auth.mail.service';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { ConfigService } from '@nestjs/config';
import { EAuthProvider } from '@/common/enums';
import { CacheService } from '@/common/cache/services/cache.service';
import { generateCode } from '@/common/utils';
import { redisKey } from '@/common/constants/redis.constant';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  private frontendUrl: string;

  constructor(
    private readonly userRepository: UserRepositoryImpl,
    private readonly helperEncryptionService: HelperEncryptionService,
    private readonly authMailService: AuthMailService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.frontendUrl = this.configService.getOrThrow('app.frontend');
  }

  public async login(
    data: LoginDto,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const user = await this.userRepository.findByEmailOrUsername(
      data.identifier,
      EAuthProvider.LOCAL,
    );

    if (!user) {
      throw new UnauthorizedException(ERROR_USER.INVALID_CREDENTIALS);
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
      teamId: user.teamId ?? null,
      teamRole: user.teamRole ?? null,
    });

    await this.upsertUserRefreshToken(user.id, tokens.refreshToken);

    return ApiResponseDto.success(tokens);
  }

  public async signup(payload: SignupDto): Promise<ApiGenericResponseDto> {
    const { email, password } = payload;

    const user = await this.userRepository.findByEmail(email);

    if (user) {
      throw new BadRequestException(ERROR_USER.ALREADY_EXISTS);
    }

    const hashPassword =
      await this.helperEncryptionService.createHash(password);

    await this.userRepository.create({
      ...payload,
      password: hashPassword,
    });

    return ApiGenericResponseDto.success('register success');
  }

  public async logout(payload: IAuthUser): Promise<ApiGenericResponseDto> {
    await this.upsertUserRefreshToken(payload.userId, null);

    return ApiGenericResponseDto.success();
  }

  public async forgotPassword(
    payload: ForgotPasswordDto,
  ): Promise<ApiGenericResponseDto> {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new NotFoundException(ERROR_USER.NOT_FOUND);
    }
    const token = generateCode(32);
    const key = redisKey.forgotPassword(token);
    await this.cacheService.set(key, user.id, 600);
    await this.authMailService.forgotPasswordMail(user, token);
    return ApiGenericResponseDto.success(
      'Send email to reset password successfully',
    );
  }

  public async resetPassword(
    payload: ResetPasswordDto,
  ): Promise<ApiGenericResponseDto> {
    const { token, password } = payload;
    const key = redisKey.forgotPassword(token);
    const userId = await this.cacheService.get<number>(key);

    if (!userId) {
      throw new BadRequestException(ERROR_AUTH.TOKEN_INVALID);
    }

    const passwordHash =
      await this.helperEncryptionService.createHash(password);

    await this.userRepository.update(userId, {
      password: passwordHash,
    });

    await this.cacheService.del(key);
    return ApiGenericResponseDto.success('Reset password success');
  }

  public async refreshTokens(
    payload: IAuthUser,
    refreshToken: string,
  ): Promise<AuthRefreshResponseDto> {
    const user = await this.userRepository.findById(payload.userId);

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
      teamId: payload.teamId,
      teamRole: payload.teamRole,
    };

    const tokens =
      await this.helperEncryptionService.createJwtTokens(tokenPayload);

    await this.upsertUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  public async createOAuthToken(payload: UserOauthDto): Promise<string> {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new NotFoundException(ERROR_USER.NOT_FOUND);
    }

    const token = await this.helperEncryptionService.createToken({
      userId: user.id,
    });

    return token;
  }

  public async verifyOAuthToken(
    token: string,
  ): Promise<ApiResponseDto<OauthResponseDto>> {
    try {
      const payload = await this.helperEncryptionService.verifyToken<{
        userId: number;
      }>(token);

      const user = await this.userRepository.findById(payload.userId);

      if (!user) {
        throw new NotFoundException(ERROR_USER.NOT_FOUND);
      }

      const tokens = await this.helperEncryptionService.createJwtTokens({
        userId: user.id,
        role: user.role,
        teamId: user.teamId ?? null,
        teamRole: user.teamRole ?? null,
      });

      await this.upsertUserRefreshToken(user.id, tokens.refreshToken);

      return ApiResponseDto.success(tokens);
    } catch (error) {
      this.logger.error(error);

      if (error instanceof NotFoundException) throw error;

      throw new BadRequestException(ERROR_AUTH.TOKEN_INVALID);
    }
  }

  public async validateOAuthLogin(payload: UserOauthDto): Promise<string> {
    let user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      user = await this.createOAuthUser(payload);
    }

    const token = await this.helperEncryptionService.createToken(
      {
        userId: user.id,
      },
      { expiresIn: '15m' },
    );

    return `${this.frontendUrl}/verify?token=${token}`;
  }

  private async createOAuthUser(payload: UserOauthDto): Promise<UserEntity> {
    try {
      return await this.userRepository.create({
        email: payload.email,
        fullName: payload.fullName,
        avatar: payload.avatar || null,
        provider: payload.provider,
        userName: payload.email,
        isVerified: true,
      });
    } catch (error) {
      this.logger.error('Error creating OAuth user', error);

      throw new BadRequestException(
        `Failed to create OAuth user: ${error.message}`,
      );
    }
  }

  private async upsertUserRefreshToken(
    userId: number,
    refreshToken: string | null,
  ) {
    const hash = refreshToken
      ? await this.helperEncryptionService.createHash(refreshToken)
      : null;

    await this.userRepository.update(userId, { refreshToken: hash });
  }
}
