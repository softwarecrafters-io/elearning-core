import { InMemoryTokenStorage } from '../../../application/ports/TokenStorage';

describe('The InMemoryTokenStorage', () => {
  it('returns none when no access token is saved', () => {
    const storage = new InMemoryTokenStorage();

    const result = storage.getAccessToken();

    expect(result.isNone()).toBe(true);
  });

  it('saves and retrieves access token', () => {
    const storage = new InMemoryTokenStorage();

    storage.saveAccessToken('access-token');
    const result = storage.getAccessToken();

    expect(result.isSome()).toBe(true);
    expect(result.getOrElse('')).toBe('access-token');
  });

  it('saves and retrieves refresh token', () => {
    const storage = new InMemoryTokenStorage();

    storage.saveRefreshToken('refresh-token');
    const result = storage.getRefreshToken();

    expect(result.isSome()).toBe(true);
    expect(result.getOrElse('')).toBe('refresh-token');
  });

  it('clears both tokens', () => {
    const storage = new InMemoryTokenStorage();
    storage.saveAccessToken('access-token');
    storage.saveRefreshToken('refresh-token');

    storage.clear();

    expect(storage.getAccessToken().isNone()).toBe(true);
    expect(storage.getRefreshToken().isNone()).toBe(true);
  });
});
