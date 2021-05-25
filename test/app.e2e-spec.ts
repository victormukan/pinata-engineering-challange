/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { LoggingService } from '../src/services/logging.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const mockLoggingService = {
      saveRequest: () => {},
      saveResponse: () => {},
      clearAllResponses: () => {},
      getAllRequests: () => [
        {
          id: '7d3931bb-d67d-4103-87a4-2a900185d071',
          filename: 'movie.mp4',
          lat: 37.46,
          long: -122.24,
        },
        {
          id: '961f9387-6bec-4e95-a22d-221094d5d522',
          filename: 'js-tutorial.mp4',
          lat: 37.46,
          long: -122.24,
        },
        {
          id: '961f9387-6bec-4e95-a22d-221094d5d525',
          filename: 'picture.jpeg',
          lat: 40.71,
          long: -74,
        },
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
      ],
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LoggingService)
      .useValue(mockLoggingService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET 200 /cache/local', () => {
    return request(app.getHttpServer())
      .get('/cache/local')
      .expect(200)
      .expect(
        JSON.stringify([
          {
            id: '7d3931bb-d67d-4103-87a4-2a900185d071',
            route: 'CA:movie.mp4',
            cached: false,
          },
          {
            id: '961f9387-6bec-4e95-a22d-221094d5d522',
            route: 'CA:js-tutorial.mp4',
            cached: false,
          },
          {
            id: '961f9387-6bec-4e95-a22d-221094d5d525',
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
        ]),
      );
  });

  it('POST 201 /cache', async () => {
    return request(app.getHttpServer())
      .post('/cache')
      .send({
        id: '7d3931bb-d67d-4103-87a4-2a900185d061',
        filename: 'movie.mp4',
        lat: 37.46,
        long: -122.24,
      })
      .expect(201)
      .expect(
        JSON.stringify({
          id: '7d3931bb-d67d-4103-87a4-2a900185d061',
          route: 'CA:movie.mp4',
          cached: false,
        }),
      );
  });

  it('POST 400 /cache', () => {
    return request(app.getHttpServer())
      .post('/cache')
      .send({
        id: 'f374fca1-3113-408b-be1c-320d4be6d037',
        filename: 'movie1.mp4',
        lat: 37.46,
        long: -122.24,
      })
      .expect(400)
      .expect(
        JSON.stringify({
          statusCode: 400,
          message: 'Cannot find movie1.mp4',
          error: 'Bad Request',
        }),
      );
  });
});
