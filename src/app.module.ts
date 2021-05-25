import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CachingService } from './services/caching.service';
import { CDNService } from './services/cdn.service';
import { LoggingService } from './services/logging.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [CDNService, CachingService, LoggingService],
})
export class AppModule {}
