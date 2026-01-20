import { Module, Global } from '@nestjs/common';
import { AppHttpService } from './app-http.service';

@Global()
@Module({
  providers: [AppHttpService],
  exports: [AppHttpService],
})
export class AppHttpModule {}
