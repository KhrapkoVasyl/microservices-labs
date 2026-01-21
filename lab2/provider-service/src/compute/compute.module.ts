import { Module } from '@nestjs/common';
import { MessagingModule } from '@common/messaging';
import { ComputeController } from './compute.controller';
import { ComputeService } from './compute.service';
import { ComputeConsumer } from './compute.consumer';

@Module({
  imports: [MessagingModule],
  controllers: [ComputeController],
  providers: [ComputeService, ComputeConsumer],
})
export class ComputeModule {}
