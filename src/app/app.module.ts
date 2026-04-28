import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@/app/health.controller';
import { CommonModule } from '@/common/common.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CompanyModule } from '@/modules/company/company.module';

@Module({
  imports: [TerminusModule, CommonModule, AuthModule, CompanyModule],
  controllers: [HealthController],
})
export class AppModule {}
