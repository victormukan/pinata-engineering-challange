import { Injectable } from '@nestjs/common';
import { DownloadFileRequestDto, DownloadFileResponseDto } from '../cdn.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingService {
  saveRequest(request: DownloadFileRequestDto) {
    const loadedRequests = fs.readFileSync(
      path.resolve(__dirname, '../../files/requests.json'),
      'utf-8',
    );

    const requests = JSON.parse(loadedRequests);
    requests.push(request);

    fs.writeFileSync(
      path.resolve(__dirname, '../../files/requests.json'),
      JSON.stringify(requests, null, 2),
      'utf-8',
    );
  }

  saveResponse(response: DownloadFileResponseDto) {
    const loadedResponses = fs.readFileSync(
      path.resolve(__dirname, '../../files/responses.json'),
      'utf-8',
    );

    const responses = JSON.parse(loadedResponses);
    responses.push(response);

    fs.writeFileSync(
      path.resolve(__dirname, '../../files/responses.json'),
      JSON.stringify(responses, null, 2),
      'utf-8',
    );
  }

  clearAllResponses() {
    fs.writeFileSync(
      path.resolve(__dirname, '../../files/responses.json'),
      JSON.stringify([]),
      'utf-8',
    );
  }

  getAllRequests(): DownloadFileRequestDto[] {
    const loadedRequests = fs.readFileSync(
      path.resolve(__dirname, '../../files/requests.json'),
      'utf-8',
    );

    return JSON.parse(loadedRequests);
  }
}
