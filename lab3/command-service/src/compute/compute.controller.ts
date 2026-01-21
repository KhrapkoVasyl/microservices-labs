import { Controller, Post, Body } from '@nestjs/common';
import { ComputeService } from './compute.service';
import { ComputeRequestDto, ComputeResponseDto } from './dto/compute.dto';

@Controller('compute')
export class ComputeController {
  constructor(private readonly computeService: ComputeService) {}

  @Post()
  async compute(@Body() dto: ComputeRequestDto): Promise<ComputeResponseDto> {
    return this.computeService.createTask(dto);
  }
}
