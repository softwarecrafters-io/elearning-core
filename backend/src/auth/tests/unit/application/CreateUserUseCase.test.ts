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

  it('rejects creation if email already exists', async () => {
    const userRepository = new InMemoryUserRepository();
    const admin = User.createAdmin(Email.create('admin@example.com'), 'Admin');
    const existingUser = User.create(Email.create('existing@example.com'), 'Existing');
    await userRepository.save(admin);
    await userRepository.save(existingUser);
    const useCase = new CreateUserUseCase(userRepository);

    await expect(useCase.execute(admin.id.value, 'existing@example.com', 'New User')).rejects.toThrow(
      'User with this email already exists'
    );
  });

  it('rejects creation if creator is not admin', async () => {
    const userRepository = new InMemoryUserRepository();
    const student = User.create(Email.create('student@example.com'), 'Student');
    await userRepository.save(student);
    const useCase = new CreateUserUseCase(userRepository);

    await expect(useCase.execute(student.id.value, 'newuser@example.com', 'New User')).rejects.toThrow(
      'Only admins can create users'
    );
  });

  it('persists created user to repository', async () => {
    const userRepository = new InMemoryUserRepository();
    const admin = User.createAdmin(Email.create('admin@example.com'), 'Admin');
    await userRepository.save(admin);
    const useCase = new CreateUserUseCase(userRepository);

    const result = await useCase.execute(admin.id.value, 'newuser@example.com', 'New User');

    const savedUser = await userRepository.findByEmail(Email.create('newuser@example.com'));
    expect(savedUser.isSome()).toBe(true);
    expect(savedUser.getOrThrow(new Error('User not found')).id.value).toBe(result.id);
  });
});
