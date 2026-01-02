import { UpdateProfileUseCase } from '../../../application/UpdateProfileUseCase';
import { InMemoryProfileRepository } from '../../../domain/repositories/ProfileRepository';
import { User } from '../../../domain/entities/User';

describe('The UpdateProfileUseCase', () => {
  it('returns updated user DTO', async () => {
    const user = User.create('user-123', 'test@example.com', 'John Doe', 'student');
    const repository = new InMemoryProfileRepository(user);
    const useCase = new UpdateProfileUseCase(repository);

    const result = await useCase.execute('Jane Doe');

    expect(result.id).toBe('user-123');
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Jane Doe');
  });
});
