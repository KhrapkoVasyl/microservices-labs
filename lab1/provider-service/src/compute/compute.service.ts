import { Injectable } from '@nestjs/common';
import { LoggerService } from '@common/logger';
import {
  ComputeRequestDto,
  ComputeResponseDto,
  TaskType,
} from './dto/compute.dto';

@Injectable()
export class ComputeService {
  constructor(private readonly logger: LoggerService) {}

  async compute(request: ComputeRequestDto): Promise<ComputeResponseDto> {
    this.logger.debug('Starting computation', {
      taskType: request.taskType,
      data: request.data,
    });

    const startTime = performance.now();

    let result: number;

    switch (request.taskType) {
      case TaskType.SUM:
        result = request.data.reduce((acc, val) => acc + val, 0);
        break;
      case TaskType.POW:
        result = request.data.reduce(
          (acc, val) => Math.pow(acc, val),
          request.data[0] || 0,
        );
        break;
      case TaskType.FIB:
        result = this.fibonacci(request.data[0] || 0);
        break;
      default:
        result = request.data.reduce((acc, val) => acc + val, 0);
    }

    const computationTimeMs = performance.now() - startTime;

    this.logger.debug('Computation completed', {
      taskType: request.taskType,
      data: request.data,
      result,
      computationTimeMs,
    });

    return {
      result,
      taskType: request.taskType,
      computationTimeMs,
    };
  }

  private fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
