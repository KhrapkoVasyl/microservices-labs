export enum TaskType {
  SUM = 'sum',
  POW = 'pow',
  FIB = 'fib',
}

export class ComputeRequestDto {
  taskType: TaskType;
  data: number[];
}

export class ComputeResponseDto {
  result: number;
  taskType: TaskType;
  computationTimeMs: number;
}
