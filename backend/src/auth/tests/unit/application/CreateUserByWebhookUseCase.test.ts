import { CreateUserByWebhookUseCase } from '../../../application/CreateUserByWebhookUseCase';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';

describe('The CreateUserByWebhookUseCase', () => {
  it('creates student user with email and name', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new CreateUserByWebhookUseCase(userRepository);

    const result = await useCase.execute('newuser@example.com', 'New User');

    expect(result.email).toBe('newuser@example.com');
    expect(result.name).toBe('New User');
    expect(result.role).toBe('student');
  });

  it('returns existing user if already exists (idempotent)', async () => {
    const userRepository = new InMemoryUserRepository();
    const existingUser = User.create(Email.create('existing@example.com'), 'Existing User');
    await userRepository.save(existingUser);
    const useCase = new CreateUserByWebhookUseCase(userRepository);

    const result = await useCase.execute('existing@example.com', 'Different Name');

    expect(result.id).toBe(existingUser.id.value);
    expect(result.name).toBe('Existing User');
  });

  it('persists created user to repository', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new CreateUserByWebhookUseCase(userRepository);

    const result = await useCase.execute('newuser@example.com', 'New User');

    const savedUser = await userRepository.findByEmail(Email.create('newuser@example.com'));
    expect(savedUser.isSome()).toBe(true);
    expect(savedUser.getOrThrow(new Error('User not found')).id.value).toBe(result.id);
  });
});
