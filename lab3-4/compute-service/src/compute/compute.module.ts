import { Module } from '@nestjs/common';
import { ComputeService } from './compute.service';

@Module({
  providers: [ComputeService],
})
export class ComputeModule {}
