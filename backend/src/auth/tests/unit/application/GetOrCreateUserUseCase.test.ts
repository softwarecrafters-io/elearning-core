import { GetOrCreateUserUseCase } from '../../../application/GetOrCreateUserUseCase';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';

describe('The GetOrCreateUserUseCase', () => {
  it('creates a new student user when email does not exist', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new GetOrCreateUserUseCase(userRepository);

    const result = await useCase.execute('newuser@example.com', 'New User');

    expect(result.email).toBe('newuser@example.com');
    expect(result.name).toBe('New User');
    expect(result.role).toBe('student');
  });

  it('returns existing user when email already exists', async () => {
    const userRepository = new InMemoryUserRepository();
    const existingUser = User.create(Email.create('existing@example.com'), 'Existing User');
    await userRepository.save(existingUser);
    const useCase = new GetOrCreateUserUseCase(userRepository);

    const result = await useCase.execute('existing@example.com', 'Different Name');

    expect(result.id).toBe(existingUser.id.value);
    expect(result.name).toBe('Existing User');
  });

  it('persists created user to repository', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new GetOrCreateUserUseCase(userRepository);

    const result = await useCase.execute('newuser@example.com', 'New User');

    const savedUser = await userRepository.findByEmail(Email.create('newuser@example.com'));
    expect(savedUser.isSome()).toBe(true);
    expect(savedUser.getOrThrow().id.value).toBe(result.id);
  });
});
