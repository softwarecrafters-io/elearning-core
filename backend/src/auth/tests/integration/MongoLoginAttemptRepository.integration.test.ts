import { MongoLoginAttemptRepository } from '../../infrastructure/adapters/MongoLoginAttemptRepository';
import { LoginAttempt } from '../../domain/entities/LoginAttempt';
import { Email } from '../../domain/value-objects/Email';
import { OTPCode } from '../../domain/value-objects/OTPCode';
import { Factory } from '../../../shared/infrastructure/factory';

describe('The MongoLoginAttemptRepository', () => {
  let repository: MongoLoginAttemptRepository;

  beforeAll(async () => {
    await Factory.connectToMongoInMemory();
    repository = new MongoLoginAttemptRepository(Factory.getMongoClient().db());
  });

  afterAll(async () => {
    await Factory.disconnectFromMongo();
  });

  beforeEach(async () => {
    await Factory.getMongoClient().db().dropDatabase();
  });

  it('stores and retrieves attempt by email', async () => {
    const attempt = LoginAttempt.create(Email.create('test@example.com'), OTPCode.generate());

    await repository.save(attempt);
    const found = await repository.findByEmail(attempt.email);

    expect(found.isSome()).toBe(true);
    expect(found.getOrThrow().otpCode.equals(attempt.otpCode)).toBe(true);
  });

  it('indicates absence when attempt does not exist', async () => {
    const email = Email.create('nonexistent@example.com');

    const found = await repository.findByEmail(email);

    expect(found.isNone()).toBe(true);
  });

  it('clears attempt after deletion', async () => {
    const attempt = LoginAttempt.create(Email.create('test@example.com'), OTPCode.generate());
    await repository.save(attempt);

    await repository.deleteByEmail(attempt.email);
    const found = await repository.findByEmail(attempt.email);

    expect(found.isNone()).toBe(true);
  });

  it('replaces existing attempt', async () => {
    const email = Email.create('test@example.com');
    const firstAttempt = LoginAttempt.create(email, OTPCode.generate());
    const secondAttempt = LoginAttempt.create(email, OTPCode.generate());

    await repository.save(firstAttempt);
    await repository.save(secondAttempt);
    const found = await repository.findByEmail(email);

    expect(found.getOrThrow().otpCode.equals(secondAttempt.otpCode)).toBe(true);
  });
});
