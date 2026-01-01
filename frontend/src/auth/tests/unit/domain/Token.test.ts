import { Token } from '../../../domain/value-objects/Token';

describe('The Token value object', () => {
  it('creates a token with a valid value', () => {
    const token = Token.create('valid-token-123');

    expect(token.value).toBe('valid-token-123');
  });

  it('throws error when token is empty', () => {
    expect(() => Token.create('')).toThrow('Token cannot be empty');
  });

  it('throws error when token is only whitespace', () => {
    expect(() => Token.create('   ')).toThrow('Token cannot be empty');
  });

  it('compares equality by value', () => {
    const token1 = Token.create('same-token');
    const token2 = Token.create('same-token');
    const token3 = Token.create('different-token');

    expect(token1.equals(token2)).toBe(true);
    expect(token1.equals(token3)).toBe(false);
  });
});
