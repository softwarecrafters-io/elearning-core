import { RegisterUserUseCase } from '../../../application/RegisterUserUseCase';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';

describe('The RegisterUserUseCase', () => {
  it('allows registration with email and name', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(userRepository);

    const result = await useCase.execute('test@example.com', 'John Doe');

    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('John Doe');
    expect(result.id).toBeDefined();
  });

  it('does not allow duplicate email', async () => {
    const userRepository = new InMemoryUserRepository();
    const existingUser = User.create(Email.create('test@example.com'), 'Existing User');
    await userRepository.save(existingUser);
    const useCase = new RegisterUserUseCase(userRepository);

    await expect(useCase.execute('test@example.com', 'John Doe')).rejects.toThrow(
      'User with this email already exists'
    );
  });
});
