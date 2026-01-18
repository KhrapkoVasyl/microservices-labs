import { Module } from '@nestjs/common';
import { LoggerModule } from '@common/logger';
import { ConfigModule } from '@common/config';
import { ComputeModule } from './compute/compute.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot('ProviderService'),
    ComputeModule,
  ],
})
export class AppModule {}
