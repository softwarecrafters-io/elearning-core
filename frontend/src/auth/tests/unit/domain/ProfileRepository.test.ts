import { User } from '../../../domain/entities/User';
import { InMemoryProfileRepository } from '../../../domain/repositories/ProfileRepository';

describe('The InMemoryProfileRepository', () => {
  it('returns the configured user on getProfile', async () => {
    const user = User.create('user-1', 'test@example.com', 'Test User', 'student');
    const repository = new InMemoryProfileRepository(user);

    const result = await repository.getProfile();

    expect(result.id).toBe('user-1');
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Test User');
  });

  it('updates the name and returns the updated user', async () => {
    const user = User.create('user-1', 'test@example.com', 'Old Name', 'student');
    const repository = new InMemoryProfileRepository(user);

    const result = await repository.updateProfile('New Name');

    expect(result.name).toBe('New Name');
    expect(result.id).toBe('user-1');
    expect(result.email).toBe('test@example.com');
  });
});
