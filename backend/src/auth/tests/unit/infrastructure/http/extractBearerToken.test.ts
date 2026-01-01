import { extractBearerToken } from '../../../../infrastructure/http/AuthMiddleware';

describe('The extractBearerToken function', () => {
  it('parses valid Bearer header correctly', () => {
    const result = extractBearerToken('Bearer my-jwt-token');

    expect(result.isSome()).toBe(true);
    expect(result.getOrElse('')).toBe('my-jwt-token');
  });

  it('does not accept empty header', () => {
    const result = extractBearerToken('');

    expect(result.isNone()).toBe(true);
  });

  it('requires Bearer prefix', () => {
    const result = extractBearerToken('Basic my-token');

    expect(result.isNone()).toBe(true);
  });

  it('requires token after Bearer prefix', () => {
    const result = extractBearerToken('Bearer');

    expect(result.isNone()).toBe(true);
  });

  it('does not accept malformed header with extra parts', () => {
    const result = extractBearerToken('Bearer token extra');

    expect(result.isNone()).toBe(true);
  });
});
