import { RefreshTokenUseCase } from '../../../application/RefreshTokenUseCase';
import { InMemorySessionRepository } from '../../../domain/repositories/SessionRepository';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';
import { Session } from '../../../domain/entities/Session';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { RefreshToken } from '../../../domain/value-objects/RefreshToken';
import { JWTTokenGenerator } from '../../../infrastructure/adapters/JWTTokenGenerator';
import { UUIDRefreshTokenGenerator } from '../../../infrastructure/adapters/UUIDRefreshTokenGenerator';
import { Id } from '../../../../shared/domain/value-objects/Id';

describe('The Token Refresh', () => {
  const createDependencies = () => {
    const sessionRepository = new InMemorySessionRepository();
    const userRepository = new InMemoryUserRepository();
    const tokenGenerator = new JWTTokenGenerator('test-secret');
    const refreshTokenGenerator = new UUIDRefreshTokenGenerator();
    return { sessionRepository, userRepository, tokenGenerator, refreshTokenGenerator };
  };

  const createUseCase = (deps: ReturnType<typeof createDependencies>) => {
    return new RefreshTokenUseCase(
      deps.sessionRepository,
      deps.userRepository,
      deps.tokenGenerator,
      deps.refreshTokenGenerator
    );
  };

  const createUserWithSession = async (deps: ReturnType<typeof createDependencies>) => {
    const email = Email.create('test@example.com');
    const user = User.create(email, 'Test User');
    await deps.userRepository.save(user);
    const session = Session.create(user.id, RefreshToken.create('valid-refresh-token'));
    await deps.sessionRepository.save(session);
    return { user, session };
  };

  it('grants new access token for valid refresh token', async () => {
    const deps = createDependencies();
    await createUserWithSession(deps);
    const useCase = createUseCase(deps);

    const result = await useCase.execute('valid-refresh-token');

    expect(result.accessToken).toBeDefined();
    expect(result.accessToken.length).toBeGreaterThan(0);
  });

  it('rotates refresh token on each use', async () => {
    const deps = createDependencies();
    await createUserWithSession(deps);
    const useCase = createUseCase(deps);

    const result = await useCase.execute('valid-refresh-token');

    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe('valid-refresh-token');
    const oldSession = await deps.sessionRepository.findByRefreshToken(RefreshToken.create('valid-refresh-token'));
    expect(oldSession.isNone()).toBe(true);
  });

  it('rejects invalid refresh token', async () => {
    const deps = createDependencies();
    const useCase = createUseCase(deps);

    await expect(useCase.execute('invalid-token')).rejects.toThrow('Invalid or expired session');
  });

  it('rejects expired session', async () => {
    const deps = createDependencies();
    const email = Email.create('test@example.com');
    const user = User.create(email, 'Test User');
    await deps.userRepository.save(user);
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const expiredSession = Session.reconstitute(
      Id.generate(),
      user.id,
      RefreshToken.create('expired-token'),
      eightDaysAgo,
      new Date(eightDaysAgo.getTime() + 7 * 24 * 60 * 60 * 1000),
      eightDaysAgo
    );
    await deps.sessionRepository.save(expiredSession);
    const useCase = createUseCase(deps);

    await expect(useCase.execute('expired-token')).rejects.toThrow('Invalid or expired session');
  });
});
