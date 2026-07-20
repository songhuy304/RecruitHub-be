import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAccessGuard } from './jwt.access.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TeamRolesGuard } from './team-role.guard';
import { UserModule } from '@/modules/users/user.module';
import { TeamModule } from '@/modules/team/team.module';

@Module({
  imports: [
    UserModule,
    TeamModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('app.throttle.ttl'),
            limit: configService.get('app.throttle.limit'),
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtAccessGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TeamRolesGuard,
    },
  ],
})
export class GuardModule {}
