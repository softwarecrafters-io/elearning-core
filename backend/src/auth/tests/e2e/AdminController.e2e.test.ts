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
  }, 30000);

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

  it('returns 401 without token', async () => {
    const response = await request(server)
      .post(ApiRoutes.Admin.Users)
      .send({ email: 'student@example.com', name: 'Student User' });

    expect(response.status).toBe(401);
  });

  it('returns 403 if user is not admin', async () => {
    const adminToken = await getAdminToken();
    await request(server)
      .post(ApiRoutes.Admin.Users)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'student@example.com', name: 'Student User' });
    await request(server).post(ApiRoutes.Auth.Login).send({ email: 'student@example.com' });
    const studentOtp = await getOtpForEmail('student@example.com');
    const studentLoginResponse = await request(server)
      .post(ApiRoutes.Auth.Verify)
      .send({ email: 'student@example.com', code: studentOtp });
    const studentToken = studentLoginResponse.body.accessToken;

    const response = await request(server)
      .post(ApiRoutes.Admin.Users)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ email: 'another@example.com', name: 'Another User' });

    expect(response.status).toBe(403);
  });

  it('returns 422 if user already exists', async () => {
    const adminToken = await getAdminToken();
    await request(server)
      .post(ApiRoutes.Admin.Users)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'student@example.com', name: 'Student User' });

    const response = await request(server)
      .post(ApiRoutes.Admin.Users)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'student@example.com', name: 'Duplicate User' });

    expect(response.status).toBe(422);
  });

  it('lists all users', async () => {
    const adminToken = await getAdminToken();
    await request(server)
      .post(ApiRoutes.Admin.Users)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'user1@example.com', name: 'User One' });
    await request(server)
      .post(ApiRoutes.Admin.Users)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'user2@example.com', name: 'User Two' });

    const response = await request(server).get(ApiRoutes.Admin.Users).set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body.map((u: { email: string }) => u.email)).toContain('admin@example.com');
    expect(response.body.map((u: { email: string }) => u.email)).toContain('user1@example.com');
    expect(response.body.map((u: { email: string }) => u.email)).toContain('user2@example.com');
  });

  it('updates user name', async () => {
    const adminToken = await getAdminToken();
    const createResponse = await request(server)
      .post(ApiRoutes.Admin.Users)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'student@example.com', name: 'Original Name' });
    const userId = createResponse.body.id;

    const response = await request(server)
      .patch(ApiRoutes.Admin.User(userId))
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Name');
    expect(response.body.email).toBe('student@example.com');
  });

  it('deletes user', async () => {
    const adminToken = await getAdminToken();
    const createResponse = await request(server)
      .post(ApiRoutes.Admin.Users)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'todelete@example.com', name: 'To Delete' });
    const userId = createResponse.body.id;

    const deleteResponse = await request(server)
      .delete(ApiRoutes.Admin.User(userId))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteResponse.status).toBe(204);
    const listResponse = await request(server).get(ApiRoutes.Admin.Users).set('Authorization', `Bearer ${adminToken}`);
    expect(listResponse.body.map((u: { email: string }) => u.email)).not.toContain('todelete@example.com');
  });

  it('returns 401 for list without token', async () => {
    const response = await request(server).get(ApiRoutes.Admin.Users);

    expect(response.status).toBe(401);
  });

  it('returns 403 for list if not admin', async () => {
    const adminToken = await getAdminToken();
    await request(server)
      .post(ApiRoutes.Admin.Users)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'student@example.com', name: 'Student' });
    await request(server).post(ApiRoutes.Auth.Login).send({ email: 'student@example.com' });
    const studentOtp = await getOtpForEmail('student@example.com');
    const studentLoginResponse = await request(server)
      .post(ApiRoutes.Auth.Verify)
      .send({ email: 'student@example.com', code: studentOtp });
    const studentToken = studentLoginResponse.body.accessToken;

    const response = await request(server).get(ApiRoutes.Admin.Users).set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
  });
});
