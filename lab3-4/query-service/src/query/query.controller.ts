import { Controller, Get, Param } from '@nestjs/common';
import { QueryService } from './query.service';
import { TaskResultDto } from './dto/query.dto';

@Controller('compute')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Get('tasks')
  async findAll(): Promise<TaskResultDto[]> {
    return this.queryService.findAll();
  }

  @Get('tasks/:taskId')
  async findById(@Param('taskId') taskId: string): Promise<TaskResultDto> {
    return this.queryService.findById(taskId);
  }
}
