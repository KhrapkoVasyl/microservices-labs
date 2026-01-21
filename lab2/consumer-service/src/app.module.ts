import { Module } from '@nestjs/common';
import { LoggerModule } from '@common/logger';
import { ConfigModule } from '@common/config';
import { AppHttpModule } from '@common/http';
import { MessagingModule } from '@common/messaging';
import { ComputeModule } from './compute/compute.module';
import { AsyncComputeModule } from './async-compute/async-compute.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot('ConsumerService'),
    AppHttpModule,
    MessagingModule,
    ComputeModule,
    AsyncComputeModule,
    HealthModule,
  ],
})
export class AppModule {}
