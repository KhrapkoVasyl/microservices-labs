import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';
import { EVENT_CONSUMER } from '../common/eventing/eventing.module';
import {
  TASK_REPOSITORY,
  TaskDocument,
} from '../common/database/database.module';
import { KafkaConsumer } from '../../../../common/eventing/kafka-consumer.service';
import { IRepository } from '../../../../common/database/database.interface';
import {
  Event,
  TaskEventType,
  TaskCreatedData,
  TaskCompletedData,
  TaskFailedData,
} from '../../../../common/eventing';

@Injectable()
export class MaterializerService implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    @Inject(EVENT_CONSUMER)
    private readonly consumer: KafkaConsumer,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: IRepository<TaskDocument>,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting materializer service...');
    await this.consumer.connect();
    await this.consumer.subscribe(this.handleEvent.bind(this));
    this.logger.log('Materializer service started');
  }

  private async handleEvent(event: Event): Promise<void> {
    const taskId = event.aggregateId;

    this.logger.log('Processing event', { eventType: event.eventType, taskId });

    switch (event.eventType) {
      case TaskEventType.TASK_CREATED:
        await this.handleTaskCreated(taskId, event.data as TaskCreatedData);
        break;
      case TaskEventType.TASK_COMPLETED:
        await this.handleTaskCompleted(taskId, event.data as TaskCompletedData);
        break;
      case TaskEventType.TASK_FAILED:
        await this.handleTaskFailed(taskId, event.data as TaskFailedData);
        break;
      default:
        this.logger.warn('Unknown event type', { eventType: event.eventType });
    }
  }

  private async handleTaskCreated(
    taskId: string,
    data: TaskCreatedData,
  ): Promise<void> {
    const task: TaskDocument = {
      taskId,
      operation: data.operation,
      data: data.data,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.taskRepository.save(task);
    this.logger.log('Task created in read model', { taskId });
  }

  private async handleTaskCompleted(
    taskId: string,
    data: TaskCompletedData,
  ): Promise<void> {
    await this.taskRepository.update(taskId, {
      status: 'COMPLETED',
      result: data.result,
      computationTimeMs: data.computationTimeMs,
      updatedAt: new Date(),
    });
    this.logger.log('Task completed in read model', {
      taskId,
      result: data.result,
    });
  }

  private async handleTaskFailed(
    taskId: string,
    data: TaskFailedData,
  ): Promise<void> {
    await this.taskRepository.update(taskId, {
      status: 'FAILED',
      error: data.error,
      updatedAt: new Date(),
    });
    this.logger.log('Task failed in read model', { taskId, error: data.error });
  }
}
