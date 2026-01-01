import { InMemoryTokenStorage } from '../../../application/ports/TokenStorage';
import { TokenRefreshScheduler } from '../../../infrastructure/services/TokenRefreshScheduler';

function createExpiredToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 60 }));
  return `${header}.${payload}.signature`;
}

function createAboutToExpireToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 10 }));
  return `${header}.${payload}.signature`;
}

function createValidToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  return `${header}.${payload}.signature`;
}

function createRefreshTokenStub(shouldFail = false): jest.Mock<Promise<void>> {
  return jest.fn().mockImplementation(() => {
    if (shouldFail) {
      return Promise.reject(new Error('Refresh failed'));
    }
    return Promise.resolve();
  });
}

describe('The TokenRefreshScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not refresh when there is no token', () => {
    const tokenStorage = new InMemoryTokenStorage();
    const refreshToken = createRefreshTokenStub();
    const scheduler = new TokenRefreshScheduler(tokenStorage, refreshToken, 1000);

    scheduler.start();

    expect(refreshToken).not.toHaveBeenCalled();
    scheduler.stop();
  });

  it('does not refresh when token is valid', () => {
    const tokenStorage = new InMemoryTokenStorage();
    tokenStorage.saveAccessToken(createValidToken());
    const refreshToken = createRefreshTokenStub();
    const scheduler = new TokenRefreshScheduler(tokenStorage, refreshToken, 1000);

    scheduler.start();

    expect(refreshToken).not.toHaveBeenCalled();
    scheduler.stop();
  });

  it('refreshes when token is about to expire', async () => {
    const tokenStorage = new InMemoryTokenStorage();
    tokenStorage.saveAccessToken(createAboutToExpireToken());
    const refreshToken = createRefreshTokenStub();
    const scheduler = new TokenRefreshScheduler(tokenStorage, refreshToken, 1000);

    scheduler.start();
    await Promise.resolve();

    expect(refreshToken).toHaveBeenCalled();
    scheduler.stop();
  });

  it('refreshes when token is expired', async () => {
    const tokenStorage = new InMemoryTokenStorage();
    tokenStorage.saveAccessToken(createExpiredToken());
    const refreshToken = createRefreshTokenStub();
    const scheduler = new TokenRefreshScheduler(tokenStorage, refreshToken, 1000);

    scheduler.start();
    await Promise.resolve();

    expect(refreshToken).toHaveBeenCalled();
    scheduler.stop();
  });

  it('notifies session expired when refresh fails', async () => {
    const tokenStorage = new InMemoryTokenStorage();
    tokenStorage.saveAccessToken(createExpiredToken());
    const refreshToken = createRefreshTokenStub(true);
    const scheduler = new TokenRefreshScheduler(tokenStorage, refreshToken, 1000);
    const sessionExpiredCallback = jest.fn();
    scheduler.onSessionExpired(sessionExpiredCallback);

    scheduler.start();
    await Promise.resolve();
    await Promise.resolve();

    expect(sessionExpiredCallback).toHaveBeenCalled();
    scheduler.stop();
  });

  it('clears storage when refresh fails', async () => {
    const tokenStorage = new InMemoryTokenStorage();
    tokenStorage.saveAccessToken(createExpiredToken());
    tokenStorage.saveRefreshToken('refresh-token');
    const refreshToken = createRefreshTokenStub(true);
    const scheduler = new TokenRefreshScheduler(tokenStorage, refreshToken, 1000);

    scheduler.start();
    await Promise.resolve();
    await Promise.resolve();

    expect(tokenStorage.getAccessToken().isNone()).toBe(true);
    expect(tokenStorage.getRefreshToken().isNone()).toBe(true);
    scheduler.stop();
  });

  it('allows unsubscribing from session expired callbacks', async () => {
    const tokenStorage = new InMemoryTokenStorage();
    tokenStorage.saveAccessToken(createExpiredToken());
    const refreshToken = createRefreshTokenStub(true);
    const scheduler = new TokenRefreshScheduler(tokenStorage, refreshToken, 1000);
    const sessionExpiredCallback = jest.fn();
    const unsubscribe = scheduler.onSessionExpired(sessionExpiredCallback);

    unsubscribe();
    scheduler.start();
    await Promise.resolve();
    await Promise.resolve();

    expect(sessionExpiredCallback).not.toHaveBeenCalled();
    scheduler.stop();
  });
});
