import { UpdateUserNameUseCase } from '../../../application/UpdateUserNameUseCase';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';

describe('The UpdateUserNameUseCase', () => {
  it('updates user name successfully', async () => {
    const user = User.create(Email.create('test@example.com'), 'Old Name');
    const userRepository = new InMemoryUserRepository();
    await userRepository.save(user);
    const useCase = new UpdateUserNameUseCase(userRepository);

    const result = await useCase.execute(user.id.value, 'New Name');

    expect(result).toEqual({
      id: user.id.value,
      email: 'test@example.com',
      name: 'New Name',
      role: 'student',
    });
  });

  it('persists the updated name', async () => {
    const user = User.create(Email.create('test@example.com'), 'Old Name');
    const userRepository = new InMemoryUserRepository();
    await userRepository.save(user);
    const useCase = new UpdateUserNameUseCase(userRepository);

    await useCase.execute(user.id.value, 'New Name');

    const updatedUser = await userRepository.findById(user.id);
    expect(updatedUser.getOrThrow(new Error('User not found')).getName()).toBe('New Name');
  });

  it('fails when user does not exist', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new UpdateUserNameUseCase(userRepository);

    await expect(useCase.execute('non-existent-id', 'New Name')).rejects.toThrow('User not found');
  });

  it('fails when name is empty', async () => {
    const user = User.create(Email.create('test@example.com'), 'Old Name');
    const userRepository = new InMemoryUserRepository();
    await userRepository.save(user);
    const useCase = new UpdateUserNameUseCase(userRepository);

    await expect(useCase.execute(user.id.value, '')).rejects.toThrow('Name cannot be empty');
  });
});
