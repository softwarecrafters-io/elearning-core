import { GetCurrentUserUseCase } from '../../../application/GetCurrentUserUseCase';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';

describe('The GetCurrentUserUseCase', () => {
  it('returns user profile for valid user id', async () => {
    const user = User.create(Email.create('test@example.com'), 'Test User');
    const userRepository = new InMemoryUserRepository();
    await userRepository.save(user);
    const useCase = new GetCurrentUserUseCase(userRepository);

    const result = await useCase.execute(user.id.value);

    expect(result).toEqual({
      id: user.id.value,
      email: 'test@example.com',
      name: 'Test User',
      role: 'student',
    });
  });

  it('fails when user does not exist', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new GetCurrentUserUseCase(userRepository);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('User not found');
  });
});
