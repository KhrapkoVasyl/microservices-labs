import { Controller, Post, Body } from '@nestjs/common';
import { AsyncComputeService } from './async-compute.service';
import {
  ComputeRequestDto,
  ComputeResultDto,
} from '../compute/dto/compute.dto';

@Controller('async')
export class AsyncComputeController {
  constructor(private readonly asyncComputeService: AsyncComputeService) {}

  @Post('compute')
  async compute(@Body() dto: ComputeRequestDto): Promise<ComputeResultDto> {
    return this.asyncComputeService.compute(dto);
  }
}
