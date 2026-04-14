import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@/app/health.controller';
import { CommonModule } from '@/common/common.module';
import { PostModule } from '@/modules/posts/post.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [TerminusModule, PostModule, CommonModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
