import { CreateUserUseCase } from '../../../application/CreateUserUseCase';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';

describe('The CreateUserUseCase', () => {
  it('allows admin to create a student user', async () => {
    const userRepository = new InMemoryUserRepository();
    const admin = User.createAdmin(Email.create('admin@example.com'), 'Admin');
    await userRepository.save(admin);
    const useCase = new CreateUserUseCase(userRepository);

    const result = await useCase.execute(admin.id.value, 'newuser@example.com', 'New User');

    expect(result.email).toBe('newuser@example.com');
    expect(result.name).toBe('New User');
    expect(result.role).toBe('student');
  });
});
