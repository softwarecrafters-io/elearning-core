import request from 'supertest';
import { createServer } from '../../../shared/infrastructure/server';
import { Factory } from '../../../shared/infrastructure/factory';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';

describe('The Admin API', () => {
  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    process.env.ADMIN_EMAIL = 'admin@example.com';
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

  async function getAdminToken(): Promise<string> {
    await request(server).post(ApiRoutes.Auth.Login).send({ email: 'admin@example.com' });
    const otp = await getOtpForEmail('admin@example.com');
    const response = await request(server).post(ApiRoutes.Auth.Verify).send({ email: 'admin@example.com', code: otp });
    return response.body.accessToken;
  }

  it('creates user when admin is authenticated', async () => {
    const adminToken = await getAdminToken();

    const response = await request(server)
      .post(ApiRoutes.Admin.Users)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'student@example.com', name: 'Student User' });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('student@example.com');
    expect(response.body.name).toBe('Student User');
    expect(response.body.role).toBe('student');
    expect(response.body.id).toBeDefined();
  });
});
