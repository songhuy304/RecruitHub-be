import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAccessGuard } from './jwt.access.guard';

@Module({
  providers: [
    JwtAccessGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
  ],
})
export class GuardModule {}
