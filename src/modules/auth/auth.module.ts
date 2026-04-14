import { DatabaseModule } from '@/common/database/database.module';
import { HelperModule } from '@/common/helper/helper.module';
import { JwtAccessStrategy } from '@/modules/auth/providers/access-jwt.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthPublicController } from './controller/auth.public.controller';
import { AuthService } from './services/auth.service';
import { JwtRefreshStrategy } from './providers/refresh-jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    HelperModule,
    PassportModule,
    DatabaseModule,
  ],
  controllers: [AuthPublicController],
  providers: [JwtAccessStrategy, JwtRefreshStrategy, AuthService],
  exports: [JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
