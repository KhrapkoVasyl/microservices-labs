import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';
import {
  TASK_REPOSITORY,
  TaskDocument,
} from '../common/database/database.module';
import { IRepository } from '../../../../common/database/database.interface';
import { TaskResultDto } from './dto/query.dto';

@Injectable()
export class QueryService {
  constructor(
    private readonly logger: LoggerService,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: IRepository<TaskDocument>,
  ) {}

  async findAll(): Promise<TaskResultDto[]> {
    this.logger.log('Fetching all tasks');
    const tasks = await this.taskRepository.findAll();
    return tasks.map(this.mapToDto);
  }

  async findById(taskId: string): Promise<TaskResultDto> {
    this.logger.log('Fetching task by id', { taskId });
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    return this.mapToDto(task);
  }

  private mapToDto(task: TaskDocument): TaskResultDto {
    return {
      taskId: task.taskId,
      taskType: task.operation,
      data: task.data,
      status: task.status,
      result: task.result,
      error: task.error,
      computationTimeMs: task.computationTimeMs,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
