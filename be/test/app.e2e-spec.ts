/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

// E2E (end-to-end) tests spin up the real Nest app
// and hit it with HTTP requests, just like the frontend would.
describe('App e2e', () => {
  let app: INestApplication;

  // Before all tests: create a real Nest app from AppModule
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // import your actual app
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init(); // boot up the application
  });

  // After all tests: close the app cleanly
  afterAll(async () => {
    await app.close();
  });

  // ✅ Happy path: should return weather for a valid city
  it('GET /api/weather?city=Dublin should return weather JSON', async () => {
    const res = await request(app.getHttpServer()) // make HTTP request to running app
      .get('/api/weather')
      .query({ city: 'Dublin' })
      .expect(200); // expect HTTP 200 OK

    // Expect the response to have basic weather properties
    expect(res.body).toHaveProperty('temp');
    expect(res.body).toHaveProperty('summary');
    expect(res.body).toHaveProperty('lat');
    expect(res.body).toHaveProperty('lon');
  });

  // ❌ Error case: missing city parameter should give 400 Bad Request
  it('GET /api/weather without city should return 400', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/weather')
      .expect(400); // expect 400 Bad Request

    // The backend should include a helpful error message
    expect(res.body.message).toBeDefined();
  });
});
