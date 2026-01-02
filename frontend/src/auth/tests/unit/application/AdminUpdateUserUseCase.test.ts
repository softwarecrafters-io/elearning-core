import { AdminUpdateUserUseCase } from '../../../application/AdminUpdateUserUseCase';
import { InMemoryAdminRepository } from '../../../domain/repositories/AdminRepository';
import { User } from '../../../domain/entities/User';

describe('The AdminUpdateUserUseCase', () => {
  it('updates user name', async () => {
    const users = [User.create('user-1', 'a@test.com', 'Alice', 'student')];
    const repository = new InMemoryAdminRepository(users);
    const useCase = new AdminUpdateUserUseCase(repository);

    const result = await useCase.execute('user-1', 'Alice Updated');

    expect(result.id).toBe('user-1');
    expect(result.name).toBe('Alice Updated');
    expect(result.email).toBe('a@test.com');
    expect(result.role).toBe('student');
  });
});
