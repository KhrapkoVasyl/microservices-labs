export enum TaskType {
  SUM = 'sum',
  POW = 'pow',
  FIB = 'fib',
}

export class ComputeRequestDto {
  taskType: TaskType;
  data: number[];
}

export class ComputeResultDto {
  result: number;
  taskType: TaskType;
  computationTimeMs: number;
  requestTimeMs: number;
}
