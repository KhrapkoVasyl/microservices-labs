import { Module } from '@nestjs/common';
import { MessagingModule } from '@common/messaging';
import { AsyncComputeController } from './async-compute.controller';
import { AsyncComputeService } from './async-compute.service';

@Module({
  imports: [MessagingModule],
  controllers: [AsyncComputeController],
  providers: [AsyncComputeService],
})
export class AsyncComputeModule {}
