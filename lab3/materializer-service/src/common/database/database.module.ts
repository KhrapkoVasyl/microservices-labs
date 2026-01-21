import { Module, DynamicModule, Global } from '@nestjs/common';
import { MongoConnectionManager } from '../../../../common/database/mongodb-connection.manager';
import { MongoRepository } from '../../../../common/database/mongodb-repository';

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export interface DatabaseModuleOptions {
  url: string;
  dbName: string;
}

export interface TaskDocument {
  taskId: string;
  operation: string;
  data: number[];
  status: string;
  result?: number;
  error?: string;
  computationTimeMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    const connectionManager = new MongoConnectionManager({
      url: options.url,
      dbName: options.dbName,
    });

    const taskRepository = new MongoRepository<TaskDocument>(
      connectionManager,
      'tasks',
      'taskId',
    );

    return {
      module: DatabaseModule,
      providers: [
        {
          provide: TASK_REPOSITORY,
          useFactory: async () => {
            await connectionManager.connect();
            return taskRepository;
          },
        },
      ],
      exports: [TASK_REPOSITORY],
    };
  }
}
