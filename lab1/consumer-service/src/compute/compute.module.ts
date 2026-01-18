import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ComputeController } from './compute.controller';
import { ComputeService } from './compute.service';

@Module({
  imports: [HttpModule],
  controllers: [ComputeController],
  providers: [ComputeService],
})
export class ComputeModule {}
