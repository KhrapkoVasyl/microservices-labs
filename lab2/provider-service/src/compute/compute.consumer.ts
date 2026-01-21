import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ComputeService } from './compute.service';
import { LoggerService } from '@common/logger';
import {
  IMessagingService,
  MESSAGING_SERVICE,
  MessageProps,
} from '@common/messaging';
import { ComputeRequestDto } from './dto/compute.dto';

@Injectable()
export class ComputeConsumer implements OnModuleInit {
  constructor(
    private readonly computeService: ComputeService,
    private readonly logger: LoggerService,
    @Inject(MESSAGING_SERVICE)
    private readonly messagingService: IMessagingService,
  ) {}

  async onModuleInit() {
    await this.consumeComputeMessage();
  }

  private async consumeComputeMessage() {
    this.logger.log('Starting compute queue listener');

    await this.messagingService.consume<ComputeRequestDto>(
      async (message, props: MessageProps) => {
        this.logger.debug('Processing compute request from queue', {
          taskType: message.taskType,
          data: message.data,
        });

        const result = await this.computeService.compute(message);

        this.logger.debug('Compute request processed', {
          taskType: message.taskType,
          result: result.result,
          computationTimeMs: result.computationTimeMs,
        });

        // Send reply if replyTo is specified
        if (props.replyTo) {
          await this.messagingService.sendToQueue(props.replyTo, result, {
            correlationId: props.correlationId,
          });
        }
      },
    );
  }
}
