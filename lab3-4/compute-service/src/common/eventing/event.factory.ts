import { v4 as uuidv4 } from 'uuid';
import { Event } from './eventing.interface';

export class EventFactory {
  static create<T>(
    eventType: string,
    aggregateType: string,
    aggregateId: string,
    data: T,
  ): Event<T> {
    return {
      eventId: uuidv4(),
      eventType,
      aggregateType,
      aggregateId,
      timestamp: new Date(),
      data,
    };
  }
}

export enum TaskEventType {
  TASK_CREATED = 'TaskCreated',
  TASK_STARTED = 'TaskStarted',
  TASK_COMPLETED = 'TaskCompleted',
  TASK_FAILED = 'TaskFailed',
}

export interface TaskCreatedData {
  operation: string;
  data: number[];
}

export interface TaskCompletedData {
  operation: string;
  data: number[];
  result: number;
  computationTimeMs: number;
}

export interface TaskFailedData {
  operation: string;
  data: number[];
  error: string;
}
