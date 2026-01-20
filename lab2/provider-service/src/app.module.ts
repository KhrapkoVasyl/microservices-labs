import { Module } from '@nestjs/common';
import { LoggerModule } from '@common/logger';
import { ConfigModule } from '@common/config';
import { ComputeModule } from './compute/compute.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot('ProviderService'),
    ComputeModule,
    HealthModule,
  ],
})
export class AppModule {}
