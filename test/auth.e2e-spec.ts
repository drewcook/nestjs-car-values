import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const email = 'a@test.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email,
        password: 'pw',
      })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(email);
      });
  });

  it('signup as a new user then get the currently logged in user', async () => {
    const email = 'a@test.com';

    // Sign up as a new user
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'pw' })
      .expect(201);

    // Pull out the cookie header
    const cookie = res.get('Set-Cookie');

    // Check the current user based off of cookie
    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie) // attach cookie in context to the request
      .expect(200);

    // Check if same user
    expect(body.email).toEqual(email);
  });
});
