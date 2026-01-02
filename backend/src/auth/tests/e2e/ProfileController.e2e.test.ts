import request from 'supertest';
import { createServer } from '../../../shared/infrastructure/server';
import { Factory } from '../../../shared/infrastructure/factory';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';

describe('The Profile API', () => {
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

  async function getOtpForEmail(email: string): Promise<string> {
    const doc = await Factory.getMongoClient().db().collection('login_attempts').findOne({ email });
    return doc?.otpCode as string;
  }

  async function createUserAndLogin(email: string, name: string): Promise<string> {
    await request(server).post(ApiRoutes.Webhooks.Users).set('X-Webhook-Secret', webhookSecret).send({ email, name });
    await request(server).post(ApiRoutes.Auth.Login).send({ email });
    const otp = await getOtpForEmail(email);
    const verifyResponse = await request(server).post(ApiRoutes.Auth.Verify).send({ email, code: otp });
    return verifyResponse.body.accessToken;
  }

  it('provides user profile for authenticated request', async () => {
    const token = await createUserAndLogin('test@example.com', 'John Doe');

    const response = await request(server).get(ApiRoutes.Profile.Me).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('test@example.com');
    expect(response.body.name).toBe('John Doe');
    expect(response.body.id).toBeDefined();
  });

  it('requires authentication for profile', async () => {
    const response = await request(server).get(ApiRoutes.Profile.Me);

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Authorization');
  });

  it('allows name change for authenticated request', async () => {
    const token = await createUserAndLogin('test@example.com', 'John Doe');

    const response = await request(server)
      .patch(ApiRoutes.Profile.Me)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Jane Doe' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Jane Doe');
    expect(response.body.email).toBe('test@example.com');
  });

  it('requires authentication for name update', async () => {
    const response = await request(server).patch(ApiRoutes.Profile.Me).send({ name: 'Jane Doe' });

    expect(response.status).toBe(401);
  });
});
