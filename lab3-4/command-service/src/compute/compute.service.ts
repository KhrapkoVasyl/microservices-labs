import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../common/logger/logger.service';
import { EVENT_PRODUCER } from '../common/eventing/eventing.module';
import { KafkaProducer } from '../common/eventing/kafka-producer.service';
import {
  EventFactory,
  TaskEventType,
  TaskCreatedData,
} from '../common/eventing/event.factory';
import { ComputeRequestDto, ComputeResponseDto } from './dto/compute.dto';

@Injectable()
export class ComputeService implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    @Inject(EVENT_PRODUCER)
    private readonly eventProducer: KafkaProducer,
  ) {}

  async onModuleInit() {
    await this.eventProducer.connect();
    this.logger.log('Kafka producer connected');
  }

  async createTask(dto: ComputeRequestDto): Promise<ComputeResponseDto> {
    const taskId = uuidv4();

    this.logger.log('Creating task', {
      taskId,
      taskType: dto.taskType,
      data: dto.data,
    });

    const event = EventFactory.create<TaskCreatedData>(
      TaskEventType.TASK_CREATED,
      'ComputationTask',
      taskId,
      {
        operation: dto.taskType,
        data: dto.data,
      },
    );

    await this.eventProducer.publish(event);

    this.logger.log('Task created event published', { taskId });

    return {
      taskId,
      status: 'PENDING',
    };
  }
}
