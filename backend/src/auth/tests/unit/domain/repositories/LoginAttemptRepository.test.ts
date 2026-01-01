import { InMemoryLoginAttemptRepository } from '../../../../domain/repositories/LoginAttemptRepository';
import { LoginAttempt } from '../../../../domain/entities/LoginAttempt';
import { Email } from '../../../../domain/value-objects/Email';
import { OTPCode } from '../../../../domain/value-objects/OTPCode';

describe('The InMemoryLoginAttemptRepository', () => {
  it('saves and retrieves login attempt by email', async () => {
    const repository = new InMemoryLoginAttemptRepository();
    const attempt = LoginAttempt.create(Email.create('test@example.com'), OTPCode.generate());

    await repository.save(attempt);
    const found = await repository.findByEmail(attempt.email);

    expect(found.isSome()).toBe(true);
    expect(found.getOrThrow().id.equals(attempt.id)).toBe(true);
  });

  it('returns Maybe.none() if attempt does not exist', async () => {
    const repository = new InMemoryLoginAttemptRepository();
    const email = Email.create('nonexistent@example.com');

    const found = await repository.findByEmail(email);

    expect(found.isNone()).toBe(true);
  });

  it('deletes attempt by email', async () => {
    const repository = new InMemoryLoginAttemptRepository();
    const attempt = LoginAttempt.create(Email.create('test@example.com'), OTPCode.generate());
    await repository.save(attempt);

    await repository.deleteByEmail(attempt.email);
    const found = await repository.findByEmail(attempt.email);

    expect(found.isNone()).toBe(true);
  });

  it('overwrites existing attempt for same email', async () => {
    const repository = new InMemoryLoginAttemptRepository();
    const email = Email.create('test@example.com');
    const attempt1 = LoginAttempt.create(email, OTPCode.generate());
    const attempt2 = LoginAttempt.create(email, OTPCode.generate());

    await repository.save(attempt1);
    await repository.save(attempt2);
    const found = await repository.findByEmail(email);

    expect(found.getOrThrow().id.equals(attempt2.id)).toBe(true);
  });
});
