import { Module } from '@nestjs/common';
import { LoggerModule } from '@common/logger';
import { ConfigModule } from '@common/config';
import { MessagingModule } from '@common/messaging';
import { ComputeModule } from './compute/compute.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot('ProviderService'),
    MessagingModule,
    ComputeModule,
    HealthModule,
  ],
})
export class AppModule {}
