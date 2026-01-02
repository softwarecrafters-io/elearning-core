import request from 'supertest';
import { createServer } from '../../../shared/infrastructure/server';
import { Factory } from '../../../shared/infrastructure/factory';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';

describe('The Health API', () => {
  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    await Factory.connectToMongoInMemory();
    server = createServer();
  }, 30000);

  afterAll(async () => {
    await Factory.disconnectFromMongo();
  });

  beforeEach(async () => {
    await Factory.getMongoClient().db().dropDatabase();
  });

  it('reports the system is healthy', async () => {
    const response = await request(server).get(ApiRoutes.Health);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.lastCheckedAt).toBeDefined();
  });

  it('maintains the same health record on every request', async () => {
    const firstResponse = await request(server).get(ApiRoutes.Health);
    const secondResponse = await request(server).get(ApiRoutes.Health);

    expect(firstResponse.body.id).toBe(secondResponse.body.id);
  });

  it('measures uptime since first request', async () => {
    await request(server).get(ApiRoutes.Health);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const secondResponse = await request(server).get(ApiRoutes.Health);

    const createdAt = new Date(secondResponse.body.createdAt).getTime();
    const lastCheckedAt = new Date(secondResponse.body.lastCheckedAt).getTime();
    const uptimeMs = lastCheckedAt - createdAt;

    expect(uptimeMs).toBeGreaterThanOrEqual(100);
  });
});
