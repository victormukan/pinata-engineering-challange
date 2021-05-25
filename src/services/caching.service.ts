import { BadRequestException, Injectable } from '@nestjs/common';
import { DownloadFileRequestDto } from '../cdn.dto';
import { CDNService } from './cdn.service';
import * as fs from 'fs';
import * as path from 'path';

interface File {
  filename: string;
  size_bytes: string;
}

@Injectable()
export class CachingService {
  constructor(private readonly cdnService: CDNService) {
    const loadedLibrary = fs.readFileSync(
      path.resolve(__dirname, '../../files/library.json'),
      'utf-8',
    );

    this.library = JSON.parse(loadedLibrary);
  }

  private readonly MAX_CACHE_SIZE = 1_000_000_000;
  private readonly library: File[] = [];
  private readonly cachingState: { [key: string]: File[] } = {};

  getCachingState() {
    return this.cachingState;
  }

  private getCacheSize(cdnId: string) {
    return this.cachingState[cdnId].reduce(
      (acc, i) => acc + Number(i.size_bytes),
      0,
    );
  }
  async getMultipleFiles(requests: DownloadFileRequestDto[]) {
    const responses = [];

    for (const i of requests) {
      const response = await this.getFile(i);
      responses.push(response);
    }

    return responses;
  }

  async getFile({ id, filename, lat, long }: DownloadFileRequestDto) {
    const file = this.library.find((i) => i.filename === filename);
    if (!file) {
      throw new BadRequestException(`Cannot find ${filename}`);
    }

    const cdnId = await this.cdnService.getCDNFromLocation(lat, long);
    let cached = false;
    const { cachingState } = this;

    if (!cachingState[cdnId]) {
      cachingState[cdnId] = [file];
    } else if (
      this.getCacheSize(cdnId) + Number(file.size_bytes) >=
      this.MAX_CACHE_SIZE
    ) {
      cachingState[cdnId] = [
        file,
        ...cachingState[cdnId].slice(0, this.cachingState[cdnId].length - 1),
      ];

      while (this.getCacheSize(cdnId) >= this.MAX_CACHE_SIZE) {
        cachingState[cdnId].pop();
      }
    } else if (cachingState[cdnId].includes(file)) {
      cached = true;
      cachingState[cdnId] = [
        file,
        ...cachingState[cdnId].filter((i) => i.filename !== filename),
      ];
    } else {
      cachingState[cdnId].unshift(file);
    }

    return { id, route: `${cdnId}:${filename}`, cached };
  }
}
