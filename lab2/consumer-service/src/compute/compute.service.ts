import { Injectable } from '@nestjs/common';
import { LoggerService } from '@common/logger';
import { ConfigService } from '@common/config';
import { AppHttpService } from '@common/http';
import {
  ComputeRequestDto,
  ComputeResultDto,
  TaskType,
} from './dto/compute.dto';

interface ProviderResponse {
  result: number;
  taskType: TaskType;
  computationTimeMs: number;
}

@Injectable()
export class ComputeService {
  private readonly providerUrl: string;

  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly httpService: AppHttpService,
  ) {
    this.providerUrl =
      this.configService.get('PROVIDER_SERVICE_URL') || 'http://localhost:3001';
  }

  async compute(dto: ComputeRequestDto): Promise<ComputeResultDto> {
    const startTime = performance.now();

    this.logger.debug('Sending compute request to provider', {
      taskType: dto.taskType,
      data: dto.data,
    });

    const data = await this.httpService.post<ProviderResponse>(
      `${this.providerUrl}/compute`,
      dto,
    );

    const internalTotalTimeMs = performance.now() - startTime;
    const internalNetworkLatencyMs =
      internalTotalTimeMs - data.computationTimeMs;

    this.logger.debug('Compute request completed', {
      taskType: dto.taskType,
      data: dto.data,
      result: data.result,
      internalComputationTimeMs: data.computationTimeMs,
      internalNetworkLatencyMs,
      internalTotalTimeMs,
    });

    return {
      result: data.result,
      taskType: data.taskType,
      internalComputationTimeMs: data.computationTimeMs,
      internalNetworkLatencyMs,
      internalTotalTimeMs,
    };
  }
}
