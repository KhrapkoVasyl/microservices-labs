import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';
import {
  EVENT_PRODUCER,
  EVENT_CONSUMER,
} from '../common/eventing/eventing.module';
import { KafkaProducer } from '../../../../common/eventing/kafka-producer.service';
import { KafkaConsumer } from '../../../../common/eventing/kafka-consumer.service';
import {
  Event,
  EventFactory,
  TaskEventType,
  TaskCreatedData,
  TaskCompletedData,
  TaskFailedData,
} from '../../../../common/eventing';

@Injectable()
export class WorkerService implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    @Inject(EVENT_PRODUCER)
    private readonly producer: KafkaProducer,
    @Inject(EVENT_CONSUMER)
    private readonly consumer: KafkaConsumer,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting worker service...');
    await this.producer.connect();
    await this.consumer.connect();
    await this.consumer.subscribe(this.handleEvent.bind(this));
    this.logger.log('Worker service started');
  }

  private async handleEvent(event: Event): Promise<void> {
    if (event.eventType !== TaskEventType.TASK_CREATED) {
      return;
    }

    const taskId = event.aggregateId;
    const data = event.data as TaskCreatedData;

    this.logger.log('Processing task', { taskId, operation: data.operation });

    const startTime = Date.now();

    try {
      const result = this.compute(data.operation, data.data);
      const computationTimeMs = Date.now() - startTime;

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

  private compute(operation: string, data: number[]): number {
    switch (operation) {
      case 'sum':
        return data.reduce((acc, val) => acc + val, 0);
      case 'pow':
        if (data.length < 2) throw new Error('pow requires at least 2 numbers');
        return Math.pow(data[0], data[1]);
      case 'fib':
        return this.fibonacci(data[0]);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
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
