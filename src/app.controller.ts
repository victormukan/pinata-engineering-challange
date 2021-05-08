import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { DownloadFileRequestDto, DownloadFileResponseDto } from './cdn.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @ApiOkResponse({
    type: DownloadFileResponseDto,
    description: 'Get cached file',
  })
  getState(@Body() body: DownloadFileRequestDto) {
    return this.appService.getCDNFromLocation(body);
  }

  @Get()
  getHello(): string {
    return 'ok';
  }
}
