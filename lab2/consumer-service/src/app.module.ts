import { Module } from '@nestjs/common';
import { LoggerModule } from '@common/logger';
import { ConfigModule } from '@common/config';
import { AppHttpModule } from '@common/http';
import { ComputeModule } from './compute/compute.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot('ConsumerService'),
    AppHttpModule,
    ComputeModule,
    HealthModule,
  ],
})
export class AppModule {}
