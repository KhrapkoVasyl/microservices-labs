export enum TaskType {
  SUM = 'sum',
  POW = 'pow',
  FIB = 'fib',
}

export class TaskResultDto {
  taskId: string;
  taskType: string;
  data: number[];
  status: string;
  result?: number;
  error?: string;
  computationTimeMs?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
