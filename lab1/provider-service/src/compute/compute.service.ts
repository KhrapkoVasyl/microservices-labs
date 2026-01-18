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
    const startTime = Date.now();

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

    const computationTimeMs = Date.now() - startTime;

    this.logger.log('Computation completed', {
      taskType: request.taskType,
      dataLength: request.data.length,
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
    let a = 0,
      b = 1;
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  }
}
