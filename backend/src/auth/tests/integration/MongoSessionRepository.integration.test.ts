import { MongoSessionRepository } from '../../infrastructure/adapters/MongoSessionRepository';
import { Session } from '../../domain/entities/Session';
import { Id } from '../../../shared/domain/value-objects/Id';
import { RefreshToken } from '../../domain/value-objects/RefreshToken';
import { Factory } from '../../../shared/infrastructure/factory';

describe('The MongoSessionRepository', () => {
  let repository: MongoSessionRepository;

  beforeAll(async () => {
    await Factory.connectToMongoInMemory();
    repository = new MongoSessionRepository(Factory.getMongoClient().db());
  }, 20000);

  afterAll(async () => {
    await Factory.disconnectFromMongo();
  });

  beforeEach(async () => {
    await Factory.getMongoClient().db().dropDatabase();
  });

  it('stores and retrieves session by refreshToken', async () => {
    const refreshToken = RefreshToken.create('refresh-token-123');
    const session = Session.create(Id.generate(), refreshToken);

    await repository.save(session);
    const found = await repository.findByRefreshToken(refreshToken);

    expect(found.isSome()).toBe(true);
    expect(found.getOrThrow().id.equals(session.id)).toBe(true);
  });

  it('retrieves session by userId', async () => {
    const userId = Id.generate();
    const session = Session.create(userId, RefreshToken.create('token'));

    await repository.save(session);
    const found = await repository.findByUserId(userId);

    expect(found.isSome()).toBe(true);
    expect(found.getOrThrow().userId.equals(userId)).toBe(true);
  });

  it('deletes session by userId', async () => {
    const userId = Id.generate();
    const session = Session.create(userId, RefreshToken.create('token'));
    await repository.save(session);

    await repository.deleteByUserId(userId);
    const found = await repository.findByUserId(userId);

    expect(found.isNone()).toBe(true);
  });

  it('deletes session by refreshToken', async () => {
    const refreshToken = RefreshToken.create('token-to-delete');
    const session = Session.create(Id.generate(), refreshToken);
    await repository.save(session);

    await repository.deleteByRefreshToken(refreshToken);
    const found = await repository.findByRefreshToken(refreshToken);

    expect(found.isNone()).toBe(true);
  });

  it('indicates absence when session not found', async () => {
    const found = await repository.findByRefreshToken(RefreshToken.create('non-existent'));

    expect(found.isNone()).toBe(true);
  });
});
