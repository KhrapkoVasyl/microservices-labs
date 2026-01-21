import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';
import {
  EVENT_PRODUCER,
  EVENT_CONSUMER,
} from '../common/eventing/eventing.module';
import { KafkaProducer } from '../common/eventing/kafka-producer.service';
import { KafkaConsumer } from '../common/eventing/kafka-consumer.service';
import { Event } from '../common/eventing/eventing.interface';
import {
  EventFactory,
  TaskEventType,
  TaskCreatedData,
  TaskCompletedData,
  TaskFailedData,
} from '../common/eventing/event.factory';
import { TaskType } from './dto/compute.dto';

@Injectable()
export class ComputeService implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    @Inject(EVENT_PRODUCER)
    private readonly producer: KafkaProducer,
    @Inject(EVENT_CONSUMER)
    private readonly consumer: KafkaConsumer,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting compute service...');
    await this.producer.connect();
    await this.consumer.connect();
    await this.consumer.subscribe(this.handleEvent.bind(this));
    this.logger.log('Compute service started');
  }

  private async handleEvent(event: Event): Promise<void> {
    if (event.eventType !== TaskEventType.TASK_CREATED) {
      return;
    }

    const taskId = event.aggregateId;
    const data = event.data as TaskCreatedData;

    this.logger.log('Processing task', { taskId, taskType: data.operation });

    const startTime = performance.now();

    try {
      const result = this.compute(data.operation as TaskType, data.data);
      const computationTimeMs = performance.now() - startTime;

      const completedEvent = EventFactory.create<TaskCompletedData>(
        TaskEventType.TASK_COMPLETED,
        'ComputationTask',
        taskId,
        {
          operation: data.operation,
          data: data.data,
          result,
          computationTimeMs,
        },
      );

      await this.producer.publish(completedEvent);
      this.logger.log('Task completed', { taskId, result, computationTimeMs });
    } catch (error) {
      const failedEvent = EventFactory.create<TaskFailedData>(
        TaskEventType.TASK_FAILED,
        'ComputationTask',
        taskId,
        {
          operation: data.operation,
          data: data.data,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );

      await this.producer.publish(failedEvent);
      this.logger.error(
        'Task failed',
        error instanceof Error ? error.stack : '',
        { taskId },
      );
    }
  }

  private compute(taskType: TaskType, data: number[]): number {
    this.logger.debug('Starting computation', { taskType, data });

    let result: number;

    switch (taskType) {
      case TaskType.SUM:
        result = data.reduce((acc, val) => acc + val, 0);
        break;
      case TaskType.POW:
        result = data.reduce((acc, val) => Math.pow(acc, val), data[0] || 0);
        break;
      case TaskType.FIB:
        result = this.fibonacci(data[0] || 0);
        break;
      default:
        result = data.reduce((acc, val) => acc + val, 0);
    }

    this.logger.debug('Computation completed', { taskType, data, result });

    return result;
  }

  private fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
