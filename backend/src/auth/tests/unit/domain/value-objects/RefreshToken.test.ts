import { RefreshToken } from '../../../../domain/value-objects/RefreshToken';

describe('The RefreshToken', () => {
  it('creates with valid value', () => {
    const token = RefreshToken.create('valid-token');

    expect(token.value).toBe('valid-token');
  });

  it('generates unique token', () => {
    const token1 = RefreshToken.generate();
    const token2 = RefreshToken.generate();

    expect(token1.value).not.toBe(token2.value);
  });

  it('rejects empty value', () => {
    expect(() => RefreshToken.create('')).toThrow('RefreshToken cannot be empty');
  });

  it('considers equal when same value', () => {
    const token1 = RefreshToken.create('same-token');
    const token2 = RefreshToken.create('same-token');

    expect(token1.equals(token2)).toBe(true);
  });

  it('considers different when different value', () => {
    const token1 = RefreshToken.create('token-a');
    const token2 = RefreshToken.create('token-b');

    expect(token1.equals(token2)).toBe(false);
  });
});
