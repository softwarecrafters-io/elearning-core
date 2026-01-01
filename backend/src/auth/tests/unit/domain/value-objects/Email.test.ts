import { Email } from '../../../../domain/value-objects/Email';

describe('The Email', () => {
  it('accepts valid email format', () => {
    const email = Email.create('test@example.com');

    expect(email.value).toBe('test@example.com');
  });

  it('requires at sign in email', () => {
    expect(() => Email.create('testexample.com')).toThrow('Invalid email format');
  });

  it('requires domain in email', () => {
    expect(() => Email.create('test@')).toThrow('Invalid email format');
  });

  it('does not allow empty email', () => {
    expect(() => Email.create('')).toThrow('Invalid email format');
  });

  it('considers two emails with same value as equal', () => {
    const email1 = Email.create('test@example.com');
    const email2 = Email.create('test@example.com');

    expect(email1.equals(email2)).toBe(true);
  });

  it('converts email to lowercase', () => {
    const email = Email.create('Test@Example.COM');

    expect(email.value).toBe('test@example.com');
  });
});
