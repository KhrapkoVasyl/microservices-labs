import { Module } from '@nestjs/common';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule } from './common/config/config.module';
import { EventingModule } from './common/eventing/eventing.module';
import { ComputeModule } from './compute/compute.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot('ComputeService'),
    EventingModule.forRoot({
      brokers: (process.env.KAFKA_BROKERS || 'localhost:29092').split(','),
      clientId: 'compute-service',
      topic: process.env.KAFKA_TOPIC || 'compute-events',
      groupId: 'compute-workers',
    }),
    ComputeModule,
  ],
})
export class AppModule {}
