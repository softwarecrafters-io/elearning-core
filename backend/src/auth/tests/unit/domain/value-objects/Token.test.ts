import { Token } from '../../../../domain/value-objects/Token';

describe('The Token', () => {
  it('accepts non-empty token value', () => {
    const token = Token.create('valid.jwt.token');

    expect(token.value).toBe('valid.jwt.token');
  });

  it('does not allow empty token', () => {
    expect(() => Token.create('')).toThrow('Token cannot be empty');
  });
});
