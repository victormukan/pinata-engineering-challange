import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { DownloadFileRequestDto, DownloadFileResponseDto } from './cdn.dto';
import { LoggingService } from './services/logging.service';
import { CachingService } from './services/caching.service';

@Controller()
export class AppController {
  constructor(
    private readonly cachingService: CachingService,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.clearAllResponses();
  }

  @Post('cache')
  @ApiCreatedResponse({
    type: DownloadFileResponseDto,
    description: 'Get cached file',
  })
  @ApiBadRequestResponse({
    description: 'File not found',
  })
  async getCachedFile(@Body() body: DownloadFileRequestDto) {
    const response = await this.cachingService.getFile(body);
    this.loggingService.saveRequest(body);
    this.loggingService.saveResponse(response);

    return response;
  }

  @Get('cache/local')
  @ApiOkResponse({
    type: [DownloadFileResponseDto],
    description: 'Process local requests',
  })
  async getCachedFilesLocal() {
    const requests = this.loggingService.getAllRequests();
    const responses = await this.cachingService.getMultipleFiles(requests);

    responses.forEach((i) => this.loggingService.saveResponse(i));
    return responses;
  }
}
