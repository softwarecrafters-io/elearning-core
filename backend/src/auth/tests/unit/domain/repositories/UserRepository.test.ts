import { InMemoryUserRepository } from '../../../../domain/repositories/UserRepository';
import { User } from '../../../../domain/entities/User';
import { Email } from '../../../../domain/value-objects/Email';

describe('The InMemoryUserRepository', () => {
  it('saves and retrieves user by email', async () => {
    const repository = new InMemoryUserRepository();
    const user = User.create(Email.create('test@example.com'), 'John Doe');

    await repository.save(user);
    const found = await repository.findByEmail(user.email);

    expect(found.isSome()).toBe(true);
    expect(found.getOrThrow().id.equals(user.id)).toBe(true);
  });

  it('returns Maybe.none() if user does not exist', async () => {
    const repository = new InMemoryUserRepository();
    const email = Email.create('nonexistent@example.com');

    const found = await repository.findByEmail(email);

    expect(found.isNone()).toBe(true);
  });

  it('updates existing user by email', async () => {
    const repository = new InMemoryUserRepository();
    const email = Email.create('test@example.com');
    const user1 = User.create(email, 'John');
    const user2 = User.create(email, 'Jane');

    await repository.save(user1);
    await repository.save(user2);
    const found = await repository.findByEmail(email);

    expect(found.getOrThrow().id.equals(user2.id)).toBe(true);
  });
});
