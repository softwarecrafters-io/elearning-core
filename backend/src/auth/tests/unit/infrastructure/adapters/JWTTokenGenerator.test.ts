import { JWTTokenGenerator } from '../../../../infrastructure/adapters/JWTTokenGenerator';
import { Email } from '../../../../domain/value-objects/Email';

describe('The JWTTokenGenerator', () => {
  it('generates a valid JWT token', () => {
    const generator = new JWTTokenGenerator('test-secret');
    const email = Email.create('test@example.com');

    const token = generator.generate(email);

    expect(token.value).toBeDefined();
    expect(token.value.split('.').length).toBe(3);
  });
});
