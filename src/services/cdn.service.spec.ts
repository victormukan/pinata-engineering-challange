import { Test } from '@nestjs/testing';
import { CDNService, StatesCode } from './cdn.service';

describe('CDN service', () => {
  let cdnService: CDNService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CDNService],
    }).compile();

    cdnService = module.get<CDNService>(CDNService);
  });

  describe('getCDNFromLocation', () => {
    it('New York coordinates should return NY', async () => {
      expect(await cdnService.getCDNFromLocation(40.71, -74)).toBe(
        StatesCode['New York'],
      );
    });

    it('Miami coordinates should return FL', async () => {
      expect(await cdnService.getCDNFromLocation(25.76, -80.19)).toBe(
        StatesCode['Florida'],
      );
    });

    it('San Francisco coordinates should return CA', async () => {
      expect(await cdnService.getCDNFromLocation(37.46, -122.24)).toBe(
        StatesCode['California'],
      );
    });

    it('Kyiv coordinates should return NonUS', async () => {
      expect(await cdnService.getCDNFromLocation(50.45, 30.52)).toBe('NonUS');
    });
  });
});
