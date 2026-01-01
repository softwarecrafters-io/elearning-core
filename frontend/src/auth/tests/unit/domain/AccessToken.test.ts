import { AccessToken } from '../../../domain/value-objects/AccessToken';

function createJWT(expiresInSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = btoa(JSON.stringify({ email: 'test@example.com', exp }));
  const signature = 'fake-signature';
  return `${header}.${payload}.${signature}`;
}

describe('The AccessToken', () => {
  it('creates from valid JWT string', () => {
    const jwt = createJWT(300);

    const token = AccessToken.create(jwt);

    expect(token.value).toBe(jwt);
  });

  it('rejects empty token', () => {
    expect(() => AccessToken.create('')).toThrow('AccessToken cannot be empty');
  });

  it('indicates expired when time has passed', () => {
    const jwt = createJWT(-10);

    const token = AccessToken.create(jwt);

    expect(token.isExpired()).toBe(true);
  });

  it('indicates not expired when time has not passed', () => {
    const jwt = createJWT(60);

    const token = AccessToken.create(jwt);

    expect(token.isExpired()).toBe(false);
  });

  it('indicates about to expire when less than 15 minutes remain', () => {
    const jwt = createJWT(10 * 60);

    const token = AccessToken.create(jwt);

    expect(token.isAboutToExpire()).toBe(true);
  });

  it('indicates not about to expire when 15 minutes or more remain', () => {
    const jwt = createJWT(20 * 60);

    const token = AccessToken.create(jwt);

    expect(token.isAboutToExpire()).toBe(false);
  });

  it('considers malformed token as about to expire', () => {
    const token = AccessToken.create('not-a-valid-jwt');

    expect(token.isAboutToExpire()).toBe(true);
  });
});
