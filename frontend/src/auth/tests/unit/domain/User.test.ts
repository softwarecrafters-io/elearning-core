import { User } from '../../../domain/entities/User';

// DONE: creates a user with id, email and name
// TODO: updates name preserving id and email

describe('The User', () => {
  it('creates a user with id, email and name', () => {
    const user = User.create('user-123', 'test@example.com', 'John Doe');

    expect(user.id).toBe('user-123');
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('John Doe');
  });

  it('updates name preserving id and email', () => {
    const user = User.create('user-123', 'test@example.com', 'John Doe');

    const updated = user.updateName('Jane Doe');

    expect(updated.id).toBe('user-123');
    expect(updated.email).toBe('test@example.com');
    expect(updated.name).toBe('Jane Doe');
  });
});
