import { AdminDeleteUserUseCase } from '../../../application/AdminDeleteUserUseCase';
import { InMemoryAdminRepository } from '../../../domain/repositories/AdminRepository';
import { User } from '../../../domain/entities/User';

// DONE: deletes user

describe('The AdminDeleteUserUseCase', () => {
  it('deletes user', async () => {
    const users = [User.create('user-1', 'a@test.com', 'Alice', 'student')];
    const repository = new InMemoryAdminRepository(users);
    const useCase = new AdminDeleteUserUseCase(repository);

    await useCase.execute('user-1');

    const remaining = await repository.listUsers();
    expect(remaining).toHaveLength(0);
  });
});
