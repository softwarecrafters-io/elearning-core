import { AdminCreateUserUseCase } from '../../../application/AdminCreateUserUseCase';
import { InMemoryUserManagementRepository } from '../../../domain/repositories/UserManagementRepository';

describe('The AdminCreateUserUseCase', () => {
  it('creates user and returns DTO', async () => {
    const repository = new InMemoryUserManagementRepository();
    const useCase = new AdminCreateUserUseCase(repository);

    const result = await useCase.execute('new@test.com', 'New User');

    expect(result.email).toBe('new@test.com');
    expect(result.name).toBe('New User');
    expect(result.role).toBe('student');
    expect(result.id).toBeDefined();
  });
});
