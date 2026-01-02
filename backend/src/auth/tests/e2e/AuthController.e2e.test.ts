import request from 'supertest';
import { createServer } from '../../../shared/infrastructure/server';
import { Factory } from '../../../shared/infrastructure/factory';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';

describe('The Auth API', () => {
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

  async function createUser(email: string, name: string): Promise<void> {
    await request(server).post(ApiRoutes.Webhooks.Users).set('X-Webhook-Secret', webhookSecret).send({ email, name });
  }

  it('initiates login for registered user', async () => {
    await createUser('test@example.com', 'John Doe');

    const response = await request(server).post(ApiRoutes.Auth.Login).send({ email: 'test@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('OTP');
  });

  it('requires registration before login', async () => {
    const response = await request(server).post(ApiRoutes.Auth.Login).send({ email: 'nonexistent@example.com' });

    expect(response.status).toBe(404);
    expect(response.body.error).toContain('not found');
  });

  it('requires active login session', async () => {
    const response = await request(server)
      .post(ApiRoutes.Auth.Verify)
      .send({ email: 'test@example.com', code: '123456' });

    expect(response.status).toBe(404);
  });

  it('does not accept wrong OTP code', async () => {
    await createUser('test@example.com', 'John Doe');
    await request(server).post(ApiRoutes.Auth.Login).send({ email: 'test@example.com' });

    const response = await request(server)
      .post(ApiRoutes.Auth.Verify)
      .send({ email: 'test@example.com', code: '000000' });

    expect(response.status).toBe(422);
    expect(response.body.error).toContain('Invalid');
  });

  it('grants access and refresh tokens for valid OTP', async () => {
    await createUser('test@example.com', 'John Doe');
    await request(server).post(ApiRoutes.Auth.Login).send({ email: 'test@example.com' });
    const otp = await getOtpForEmail('test@example.com');

    const response = await request(server).post(ApiRoutes.Auth.Verify).send({ email: 'test@example.com', code: otp });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  it('blocks verification after 5 failed OTP attempts', async () => {
    await createUser('test@example.com', 'John Doe');
    await request(server).post(ApiRoutes.Auth.Login).send({ email: 'test@example.com' });
    await request(server).post(ApiRoutes.Auth.Verify).send({ email: 'test@example.com', code: '000000' });
    await request(server).post(ApiRoutes.Auth.Verify).send({ email: 'test@example.com', code: '000000' });
    await request(server).post(ApiRoutes.Auth.Verify).send({ email: 'test@example.com', code: '000000' });
    await request(server).post(ApiRoutes.Auth.Verify).send({ email: 'test@example.com', code: '000000' });
    await request(server).post(ApiRoutes.Auth.Verify).send({ email: 'test@example.com', code: '000000' });

    const response = await request(server)
      .post(ApiRoutes.Auth.Verify)
      .send({ email: 'test@example.com', code: '000000' });

    expect(response.status).toBe(422);
    expect(response.body.error).toContain('Too many failed attempts');
  });

  it('refreshes tokens with valid refresh token', async () => {
    await createUser('test@example.com', 'John Doe');
    await request(server).post(ApiRoutes.Auth.Login).send({ email: 'test@example.com' });
    const otp = await getOtpForEmail('test@example.com');
    const verifyResponse = await request(server)
      .post(ApiRoutes.Auth.Verify)
      .send({ email: 'test@example.com', code: otp });

    const response = await request(server)
      .post(ApiRoutes.Auth.Refresh)
      .send({ refreshToken: verifyResponse.body.refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  it('rejects refresh with invalid token', async () => {
    const response = await request(server).post(ApiRoutes.Auth.Refresh).send({ refreshToken: 'invalid-token' });

    expect(response.status).toBe(422);
  });

  it('invalidates session on logout', async () => {
    await createUser('test@example.com', 'John Doe');
    await request(server).post(ApiRoutes.Auth.Login).send({ email: 'test@example.com' });
    const otp = await getOtpForEmail('test@example.com');
    const verifyResponse = await request(server)
      .post(ApiRoutes.Auth.Verify)
      .send({ email: 'test@example.com', code: otp });
    const accessToken = verifyResponse.body.accessToken;
    const refreshToken = verifyResponse.body.refreshToken;

    await request(server).post(ApiRoutes.Auth.Logout).set('Authorization', `Bearer ${accessToken}`);
    const refreshResponse = await request(server).post(ApiRoutes.Auth.Refresh).send({ refreshToken });

    expect(refreshResponse.status).toBe(422);
  });

  it('invalidates previous session on new login', async () => {
    await createUser('test@example.com', 'John Doe');
    await request(server).post(ApiRoutes.Auth.Login).send({ email: 'test@example.com' });
    const otp1 = await getOtpForEmail('test@example.com');
    const verifyResponse1 = await request(server)
      .post(ApiRoutes.Auth.Verify)
      .send({ email: 'test@example.com', code: otp1 });
    const oldRefreshToken = verifyResponse1.body.refreshToken;
    await request(server).post(ApiRoutes.Auth.Login).send({ email: 'test@example.com' });
    const otp2 = await getOtpForEmail('test@example.com');
    await request(server).post(ApiRoutes.Auth.Verify).send({ email: 'test@example.com', code: otp2 });

    const refreshResponse = await request(server).post(ApiRoutes.Auth.Refresh).send({ refreshToken: oldRefreshToken });

    expect(refreshResponse.status).toBe(422);
  });
});
