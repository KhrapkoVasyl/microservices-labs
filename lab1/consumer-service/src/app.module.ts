import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '@common/logger';
import { ConfigModule } from '@common/config';
import { ComputeModule } from './compute/compute.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot('ConsumerService'),
    HttpModule,
    ComputeModule,
  ],
})
export class AppModule {}
