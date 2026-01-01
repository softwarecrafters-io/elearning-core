import { GetProfileUseCase } from '../../../application/GetProfileUseCase';
import { InMemoryProfileRepository } from '../../../domain/repositories/ProfileRepository';
import { User } from '../../../domain/entities/User';

describe('The GetProfileUseCase', () => {
  it('provides the authenticated user profile information', async () => {
    const user = User.create('user-123', 'test@example.com', 'John Doe');
    const repository = new InMemoryProfileRepository(user);
    const useCase = new GetProfileUseCase(repository);

    const profile = await useCase.execute();

    expect(profile.id).toBe('user-123');
    expect(profile.email).toBe('test@example.com');
    expect(profile.name).toBe('John Doe');
  });
});
