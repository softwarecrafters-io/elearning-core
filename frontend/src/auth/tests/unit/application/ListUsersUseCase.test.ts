import { ListUsersUseCase } from '../../../application/ListUsersUseCase';
import { InMemoryAdminRepository } from '../../../domain/repositories/AdminRepository';
import { User } from '../../../domain/entities/User';

describe('The ListUsersUseCase', () => {
  it('returns list of users as DTOs', async () => {
    const users = [
      User.create('user-1', 'a@test.com', 'Alice', 'student'),
      User.create('user-2', 'b@test.com', 'Bob', 'admin'),
    ];
    const repository = new InMemoryAdminRepository(users);
    const useCase = new ListUsersUseCase(repository);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 'user-1', email: 'a@test.com', name: 'Alice', role: 'student' });
    expect(result[1]).toEqual({ id: 'user-2', email: 'b@test.com', name: 'Bob', role: 'admin' });
  });
});
