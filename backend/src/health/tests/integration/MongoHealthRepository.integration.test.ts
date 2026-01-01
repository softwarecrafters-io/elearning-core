import { MongoHealthRepository } from '../../infrastructure/adapters/MongoHealthRepository';
import { Health } from '../../domain/entities/Health';
import { Id } from '../../../shared/domain/value-objects/Id';
import { Factory } from '../../../shared/infrastructure/factory';

describe('The MongoHealthRepository', () => {
  let repository: MongoHealthRepository;

  const jan1At10am = new Date('2026-01-01T10:00:00.000Z');
  const jan1At10am5min = new Date('2026-01-01T10:05:00.000Z');
  const fiveMinutesInSeconds = 300;

  beforeAll(async () => {
    await Factory.connectToMongoInMemory();
    repository = new MongoHealthRepository(Factory.getMongoClient().db());
  });

  afterAll(async () => {
    await Factory.disconnectFromMongo();
  });

  beforeEach(async () => {
    await Factory.getMongoClient().db().dropDatabase();
  });

  it('persists and retrieves health data', async () => {
    const id = Id.generate();
    const health = Health.create(id, jan1At10am, jan1At10am);

    await repository.save(health);
    const retrieved = await repository.find();

    expect(retrieved.isSome()).toBe(true);
    expect(retrieved.getOrThrow(new Error('Not found')).equals(health)).toBe(true);
  });

  it('indicates absence when empty', async () => {
    const retrieved = await repository.find();

    expect(retrieved.isNone()).toBe(true);
  });

  it('maintains a single record across saves', async () => {
    const id = Id.generate();
    const health = Health.create(id, jan1At10am, jan1At10am);
    await repository.save(health);
    health.update(jan1At10am5min);
    await repository.save(health);

    const retrieved = await repository.find();

    expect(retrieved.getOrThrow(new Error('Not found')).equals(health)).toBe(true);
  });

  it('preserves creation time across updates', async () => {
    const health = Health.create(Id.generate(), jan1At10am, jan1At10am);
    await repository.save(health);
    health.update(jan1At10am5min);
    await repository.save(health);

    const retrieved = await repository.find();
    const foundHealth = retrieved.getOrThrow(new Error('Not found'));
    const primitives = foundHealth.toPrimitives();

    expect(primitives.createdAt).toBe(jan1At10am.toISOString());
    expect(primitives.lastCheckedAt).toBe(jan1At10am5min.toISOString());
    expect(foundHealth.uptime()).toBe(fiveMinutesInSeconds);
  });
});
