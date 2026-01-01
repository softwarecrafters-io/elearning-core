import { LogoutUseCase } from '../../../application/LogoutUseCase';
import { InMemorySessionRepository } from '../../../domain/repositories/SessionRepository';
import { Session } from '../../../domain/entities/Session';
import { RefreshToken } from '../../../domain/value-objects/RefreshToken';
import { Id } from '../../../../shared/domain/value-objects/Id';

describe('The Logout', () => {
  it('removes session for the user', async () => {
    const sessionRepository = new InMemorySessionRepository();
    const userId = Id.generate();
    const session = Session.create(userId, RefreshToken.create('refresh-token'));
    await sessionRepository.save(session);
    const useCase = new LogoutUseCase(sessionRepository);

    await useCase.execute(userId.value);

    const found = await sessionRepository.findByUserId(userId);
    expect(found.isNone()).toBe(true);
  });

  it('succeeds even when no session exists', async () => {
    const sessionRepository = new InMemorySessionRepository();
    const useCase = new LogoutUseCase(sessionRepository);

    await expect(useCase.execute('non-existent-user-id')).resolves.not.toThrow();
  });
});
