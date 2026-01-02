import { User } from '../../../domain/entities/User';
import { InMemoryUserManagementRepository } from '../../../domain/repositories/UserManagementRepository';

describe('The InMemoryUserManagementRepository', () => {
  it('lists all users', async () => {
    const users = [
      User.create('user-1', 'a@test.com', 'Alice', 'student'),
      User.create('user-2', 'b@test.com', 'Bob', 'admin'),
    ];
    const repository = new InMemoryUserManagementRepository(users);

    const result = await repository.listUsers();

    expect(result).toHaveLength(2);
    expect(result[0].email).toBe('a@test.com');
    expect(result[1].email).toBe('b@test.com');
  });

  it('creates a new user', async () => {
    const repository = new InMemoryUserManagementRepository();

    const user = await repository.createUser('new@test.com', 'New User');

    expect(user.email).toBe('new@test.com');
    expect(user.name).toBe('New User');
    expect(user.role).toBe('student');
    const users = await repository.listUsers();
    expect(users).toHaveLength(1);
  });

  it('updates user name', async () => {
    const users = [User.create('user-1', 'a@test.com', 'Alice', 'student')];
    const repository = new InMemoryUserManagementRepository(users);

    const updated = await repository.updateUser('user-1', 'Alice Updated');

    expect(updated.name).toBe('Alice Updated');
    expect(updated.email).toBe('a@test.com');
  });

  it('deletes a user', async () => {
    const users = [User.create('user-1', 'a@test.com', 'Alice', 'student')];
    const repository = new InMemoryUserManagementRepository(users);

    await repository.deleteUser('user-1');

    const remaining = await repository.listUsers();
    expect(remaining).toHaveLength(0);
  });

  it('throws error when updating non-existent user', async () => {
    const repository = new InMemoryUserManagementRepository();

    await expect(repository.updateUser('non-existent', 'Name')).rejects.toThrow('User non-existent not found');
  });

  it('throws error when deleting non-existent user', async () => {
    const repository = new InMemoryUserManagementRepository();

    await expect(repository.deleteUser('non-existent')).rejects.toThrow('User non-existent not found');
  });
});
