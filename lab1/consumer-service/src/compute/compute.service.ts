import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '@common/logger';
import { ConfigService } from '@common/config';
import {
  ComputeRequestDto,
  ComputeResultDto,
  TaskType,
} from './dto/compute.dto';

@Injectable()
export class ComputeService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  async compute(dto: ComputeRequestDto): Promise<ComputeResultDto> {
    const startTime = Date.now();

    this.logger.log('Sending compute request to provider', {
      taskType: dto.taskType,
      dataLength: dto.data.length,
    });

    const response = await firstValueFrom(
      this.httpService.post<{
        result: number;
        taskType: TaskType;
        computationTimeMs: number;
      }>(
        `${this.configService.get('PROVIDER_SERVICE_URL') || 'http://localhost:3001'}/compute`,
        dto,
      ),
    );

    const requestTimeMs = Date.now() - startTime;

    this.logger.log('Compute request completed', {
      taskType: dto.taskType,
      result: response.data.result,
      computationTimeMs: response.data.computationTimeMs,
      requestTimeMs,
    });

    return {
      result: response.data.result,
      taskType: response.data.taskType,
      computationTimeMs: response.data.computationTimeMs,
      requestTimeMs,
    };
  }
}
