import { Controller, Post, Body } from '@nestjs/common';
import { ComputeService } from './compute.service';
import { ComputeRequestDto, ComputeResultDto } from './dto/compute.dto';

@Controller('compute')
export class ComputeController {
  constructor(private readonly computeService: ComputeService) {}

  @Post()
  async compute(@Body() dto: ComputeRequestDto): Promise<ComputeResultDto> {
    return this.computeService.compute(dto);
  }
}
