import { ListUsersUseCase } from '../../../application/ListUsersUseCase';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';

// DONE: returns all users as DTOs

describe('The ListUsersUseCase', () => {
  it('returns all users as DTOs', async () => {
    const users = [User.create(Email.create('a@test.com'), 'Alice'), User.create(Email.create('b@test.com'), 'Bob')];
    const repository = new InMemoryUserRepository(users);
    const useCase = new ListUsersUseCase(repository);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].email).toBe('a@test.com');
    expect(result[0].name).toBe('Alice');
    expect(result[0].role).toBe('student');
    expect(result[1].email).toBe('b@test.com');
  });
});
