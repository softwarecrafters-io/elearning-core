import { AdminCreateUserUseCase } from '../../../application/AdminCreateUserUseCase';
import { InMemoryAdminRepository } from '../../../domain/repositories/AdminRepository';

describe('The AdminCreateUserUseCase', () => {
  it('creates user and returns DTO', async () => {
    const repository = new InMemoryAdminRepository();
    const useCase = new AdminCreateUserUseCase(repository);

    const result = await useCase.execute('new@test.com', 'New User');

    expect(result.email).toBe('new@test.com');
    expect(result.name).toBe('New User');
    expect(result.role).toBe('student');
    expect(result.id).toBeDefined();
  });
});
