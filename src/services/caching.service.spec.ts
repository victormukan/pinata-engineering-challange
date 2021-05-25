import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CachingService } from './caching.service';
import { CDNService } from './cdn.service';

const mockRequests = [
  {
    id: '961f9387-6bec-4e95-a22d-221094d5d524',
    filename: 'picture.jpeg',
    lat: 40.71,
    long: -74,
  },
  {
    id: '961f9387-6bec-4e95-a22d-221094d5d523',
    filename: 'js-tutorial.mp4',
    lat: 40.71,
    long: -74,
  },
  {
    id: '961f9387-6bec-4e95-a22d-221094d5d525',
    filename: 'picture.jpeg',
    lat: 37.46,
    long: -122.24,
  },
];

describe('Caching Services', () => {
  let cachingService: CachingService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CDNService, CachingService],
    }).compile();

    cachingService = module.get<CachingService>(CachingService);
  });

  describe('getFile', () => {
    it('should cache single file', async () => {
      const responses = await cachingService.getFile(mockRequests[0]);

      expect(responses).toStrictEqual({
        id: '961f9387-6bec-4e95-a22d-221094d5d524',
        route: 'NY:picture.jpeg',
        cached: false,
      });

      expect(cachingService.getCachingState()).toStrictEqual({
        NY: [{ filename: 'picture.jpeg', size_bytes: 100000000 }],
      });
    });

    it('should cache and return cached file', async () => {
      const responses = await cachingService.getMultipleFiles([
        mockRequests[0],
        mockRequests[0],
        mockRequests[1],
      ]);

      expect(responses).toStrictEqual([
        {
          id: '961f9387-6bec-4e95-a22d-221094d5d524',
          route: 'NY:picture.jpeg',
          cached: false,
        },
        {
          id: '961f9387-6bec-4e95-a22d-221094d5d524',
          route: 'NY:picture.jpeg',
          cached: true,
        },
        {
          id: '961f9387-6bec-4e95-a22d-221094d5d523',
          route: 'NY:js-tutorial.mp4',
          cached: false,
        },
      ]);

      expect(cachingService.getCachingState()).toStrictEqual({
        NY: [
          { filename: 'js-tutorial.mp4', size_bytes: 400000000 },
          { filename: 'picture.jpeg', size_bytes: 100000000 },
        ],
      });
    });

    it('new cache file should be at begging of cache queue', async () => {
      const responses = await cachingService.getMultipleFiles([
        mockRequests[0],
        mockRequests[1],
      ]);

      expect(responses).toStrictEqual([
        {
          id: '961f9387-6bec-4e95-a22d-221094d5d524',
          route: 'NY:picture.jpeg',
          cached: false,
        },
        {
          id: '961f9387-6bec-4e95-a22d-221094d5d523',
          route: 'NY:js-tutorial.mp4',
          cached: false,
        },
      ]);

      expect(cachingService.getCachingState()).toStrictEqual({
        NY: [
          { filename: 'js-tutorial.mp4', size_bytes: 400000000 },
          { filename: 'picture.jpeg', size_bytes: 100000000 },
        ],
      });
    });

    it('if cache is bigger than 1GB should discard least recently used', async () => {
      await cachingService.getMultipleFiles([
        mockRequests[1],
        mockRequests[0],
        {
          id: '7d3931bb-d67d-4103-87a4-2a900185d071',
          filename: 'movie.mp4',
          lat: 40.71,
          long: -74,
        },
      ]);

      expect(cachingService.getCachingState()).toStrictEqual({
        NY: [
          { filename: 'movie.mp4', size_bytes: 700000000 },
          { filename: 'picture.jpeg', size_bytes: 100000000 },
        ],
      });
    });

    it('if cache is bigger than 1GB should discard multiple least recently used', async () => {
      await cachingService.getMultipleFiles([
        mockRequests[0],
        mockRequests[1],
        {
          id: '7d3931bb-d67d-4103-87a4-2a900185d071',
          filename: 'movie.mp4',
          lat: 40.71,
          long: -74,
        },
      ]);

      expect(cachingService.getCachingState()).toStrictEqual({
        NY: [{ filename: 'movie.mp4', size_bytes: 700000000 }],
      });
    });

    it('should cache for multiple regions', async () => {
      const responses = await cachingService.getMultipleFiles(mockRequests);

      expect(responses).toStrictEqual([
        {
          id: '961f9387-6bec-4e95-a22d-221094d5d524',
          route: 'NY:picture.jpeg',
          cached: false,
        },
        {
          id: '961f9387-6bec-4e95-a22d-221094d5d523',
          route: 'NY:js-tutorial.mp4',
          cached: false,
        },
        {
          id: '961f9387-6bec-4e95-a22d-221094d5d525',
          route: 'CA:picture.jpeg',
          cached: false,
        },
      ]);

      expect(cachingService.getCachingState()).toStrictEqual({
        NY: [
          { filename: 'js-tutorial.mp4', size_bytes: 400000000 },
          { filename: 'picture.jpeg', size_bytes: 100000000 },
        ],
        CA: [{ filename: 'picture.jpeg', size_bytes: 100000000 }],
      });
    });

    it('should throw Exception when file not found', async () => {
      expect(
        cachingService.getFile({
          id: '961f9387-6bec-4e95-a22d-221094d5d524',
          filename: 'not-found.jpeg',
          lat: 40.71,
          long: -74,
        }),
      ).rejects.toEqual(new BadRequestException('Cannot find not-found.jpeg'));
    });
  });
});
