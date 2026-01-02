import request from 'supertest';
import { createServer } from '../../../shared/infrastructure/server';
import { Factory } from '../../../shared/infrastructure/factory';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';

describe('The Webhook API', () => {
  let server: ReturnType<typeof createServer>;
  const webhookSecret = 'test-webhook-secret';

  beforeAll(async () => {
    process.env.USER_WEBHOOK_SECRET = webhookSecret;
    await Factory.connectToMongoInMemory();
    server = createServer();
  });

  afterAll(async () => {
    await Factory.disconnectFromMongo();
  });

  beforeEach(async () => {
    await Factory.getMongoClient().db().dropDatabase();
  });

  it('creates user with valid secret', async () => {
    const response = await request(server)
      .post(ApiRoutes.Webhooks.Users)
      .set('X-Webhook-Secret', webhookSecret)
      .send({ email: 'student@example.com', name: 'Student User' });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('student@example.com');
    expect(response.body.name).toBe('Student User');
    expect(response.body.role).toBe('student');
    expect(response.body.id).toBeDefined();
  });

  it('returns existing user (idempotent)', async () => {
    await request(server)
      .post(ApiRoutes.Webhooks.Users)
      .set('X-Webhook-Secret', webhookSecret)
      .send({ email: 'student@example.com', name: 'Student User' });

    const response = await request(server)
      .post(ApiRoutes.Webhooks.Users)
      .set('X-Webhook-Secret', webhookSecret)
      .send({ email: 'student@example.com', name: 'Different Name' });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('student@example.com');
    expect(response.body.name).toBe('Student User');
  });

  it('returns 401 without secret', async () => {
    const response = await request(server)
      .post(ApiRoutes.Webhooks.Users)
      .send({ email: 'student@example.com', name: 'Student User' });

    expect(response.status).toBe(401);
  });

  it('returns 401 with invalid secret', async () => {
    const response = await request(server)
      .post(ApiRoutes.Webhooks.Users)
      .set('X-Webhook-Secret', 'wrong-secret')
      .send({ email: 'student@example.com', name: 'Student User' });

    expect(response.status).toBe(401);
  });
});
