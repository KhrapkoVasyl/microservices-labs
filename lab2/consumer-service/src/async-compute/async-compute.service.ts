import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '@common/logger';
import { IRequestReplyClient, REQUEST_REPLY_CLIENT } from '@common/messaging';
import {
  ComputeRequestDto,
  ComputeResultDto,
  TaskType,
} from '../compute/dto/compute.dto';

interface ProviderResponse {
  result: number;
  taskType: TaskType;
  computationTimeMs: number;
}

@Injectable()
export class AsyncComputeService {
  constructor(
    private readonly logger: LoggerService,
    @Inject(REQUEST_REPLY_CLIENT)
    private readonly requestReplyClient: IRequestReplyClient,
  ) {}

  async compute(dto: ComputeRequestDto): Promise<ComputeResultDto> {
    const startTime = performance.now();

    this.logger.debug('Sending async compute request via RabbitMQ', {
      taskType: dto.taskType,
      data: dto.data,
    });

    const data = await this.requestReplyClient.sendAndReceive<
      ComputeRequestDto,
      ProviderResponse
    >(dto);

    const internalTotalTimeMs = performance.now() - startTime;
    const internalNetworkLatencyMs =
      internalTotalTimeMs - data.computationTimeMs;

    this.logger.debug('Async compute request completed', {
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
