import { DeleteUserUseCase } from '../../../application/DeleteUserUseCase';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';

// DONE: deletes user by id

describe('The DeleteUserUseCase', () => {
  it('deletes user by id', async () => {
    const user = User.create(Email.create('a@test.com'), 'Alice');
    const repository = new InMemoryUserRepository([user]);
    const useCase = new DeleteUserUseCase(repository);

    await useCase.execute(user.id.value);

    const remaining = await repository.findAll();
    expect(remaining).toHaveLength(0);
  });
});
