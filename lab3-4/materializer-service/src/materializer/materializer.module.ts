import { Module } from '@nestjs/common';
import { MaterializerService } from './materializer.service';

@Module({
  providers: [MaterializerService],
})
export class MaterializerModule {}
