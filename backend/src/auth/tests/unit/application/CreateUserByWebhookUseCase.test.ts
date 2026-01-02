import { CreateUserByWebhookUseCase } from '../../../application/CreateUserByWebhookUseCase';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';

describe('The CreateUserByWebhookUseCase', () => {
  it('creates student user with email and name', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new CreateUserByWebhookUseCase(userRepository);

    const result = await useCase.execute('newuser@example.com', 'New User');

    expect(result.email).toBe('newuser@example.com');
    expect(result.name).toBe('New User');
    expect(result.role).toBe('student');
  });
});
