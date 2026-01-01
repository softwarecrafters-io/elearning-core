import { Session } from '../../../domain/entities/Session';
import { InMemorySessionRepository } from '../../../domain/repositories/SessionRepository';
import { Id } from '../../../../shared/domain/value-objects/Id';
import { RefreshToken } from '../../../domain/value-objects/RefreshToken';

describe('The InMemorySessionRepository', () => {
  it('persists and retrieves session by refresh token', async () => {
    const repository = new InMemorySessionRepository();
    const refreshToken = RefreshToken.create('refresh-token-123');
    const session = Session.create(Id.generate(), refreshToken);

    await repository.save(session);
    const found = await repository.findByRefreshToken(refreshToken);

    expect(found.isSome()).toBe(true);
    expect(found.getOrThrow().id.equals(session.id)).toBe(true);
  });

  it('retrieves session by user identifier', async () => {
    const repository = new InMemorySessionRepository();
    const userId = Id.generate();
    const session = Session.create(userId, RefreshToken.create('token'));

    await repository.save(session);
    const found = await repository.findByUserId(userId);

    expect(found.isSome()).toBe(true);
    expect(found.getOrThrow().userId.equals(userId)).toBe(true);
  });

  it('removes session when user identifier provided', async () => {
    const repository = new InMemorySessionRepository();
    const userId = Id.generate();
    const session = Session.create(userId, RefreshToken.create('token'));
    await repository.save(session);

    await repository.deleteByUserId(userId);
    const found = await repository.findByUserId(userId);

    expect(found.isNone()).toBe(true);
  });

  it('removes session when refresh token provided', async () => {
    const repository = new InMemorySessionRepository();
    const refreshToken = RefreshToken.create('token-to-delete');
    const session = Session.create(Id.generate(), refreshToken);
    await repository.save(session);

    await repository.deleteByRefreshToken(refreshToken);
    const found = await repository.findByRefreshToken(refreshToken);

    expect(found.isNone()).toBe(true);
  });

  it('indicates absence when session not found by refresh token', async () => {
    const repository = new InMemorySessionRepository();

    const found = await repository.findByRefreshToken(RefreshToken.create('non-existent'));

    expect(found.isNone()).toBe(true);
  });
});
