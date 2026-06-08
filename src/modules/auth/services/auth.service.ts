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
import { TokenExpiredError } from '@nestjs/jwt';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepositoryImpl,
    private readonly helperEncryptionService: HelperEncryptionService,
    private readonly authMailService: AuthMailService,
  ) {}

  public async login(
    data: LoginDto,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const user = await this.userRepository.findByEmailOrUsername(data.userName);

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

    const token = await this.helperEncryptionService.createForgotPasswordToken({
      userId: user.id,
      role: user.role,
      teamId: user.teamId ?? null,
      teamRole: user.teamRole ?? null,
    });

    await this.authMailService.forgotPasswordMail(user, token);

    return ApiGenericResponseDto.success(
      'Send email to reset password successfully',
    );
  }

  public async resetPassword(
    payload: ResetPasswordDto,
  ): Promise<ApiGenericResponseDto> {
    const { token } = payload;

    let userId: number;

    try {
      const jwt =
        await this.helperEncryptionService.verifyForgotPasswordToken(token);

      userId = jwt.userId;
    } catch (error) {
      this.logger.error(error);

      if (error instanceof TokenExpiredError) {
        throw new BadRequestException(ERROR_AUTH.TOKEN_EXPIRED);
      }

      throw new BadRequestException(ERROR_AUTH.TOKEN_INVALID);
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(ERROR_USER.NOT_FOUND);
    }

    const passwordHash = await this.helperEncryptionService.createHash(
      payload.password,
    );

    await this.userRepository.update(user.id, {
      password: passwordHash,
    });

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

  public async validateOAuthLogin(
    payload: UserOauthDto,
  ): Promise<OauthResponseDto> {
    let user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      user = await this.createOAuthUser(payload);
    }

    const tokens = await this.helperEncryptionService.createJwtTokens({
      userId: user.id,
      role: user.role,
      teamId: user.teamId ?? null,
      teamRole: user.teamRole ?? null,
    });

    await this.upsertUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
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
  ): Promise<void> {
    const hash = await this.helperEncryptionService.createHash(refreshToken);

    await this.userRepository.update(userId, {
      refreshToken: hash,
    });
  }

  // private async verifyEmail(email: string): Promise<void> {}
}
