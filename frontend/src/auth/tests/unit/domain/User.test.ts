import { User } from '../../../domain/entities/User';

// DONE: creates a user with id, email and name
// DONE: updates name preserving id and email
// DONE: creates user with role
// DONE: isAdmin returns true for admin role
// DONE: isAdmin returns false for student role

describe('The User', () => {
  it('creates a user with id, email and name', () => {
    const user = User.create('user-123', 'test@example.com', 'John Doe', 'student');

    expect(user.id).toBe('user-123');
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('John Doe');
  });

  it('updates name preserving id and email', () => {
    const user = User.create('user-123', 'test@example.com', 'John Doe', 'student');

    const updated = user.updateName('Jane Doe');

    expect(updated.id).toBe('user-123');
    expect(updated.email).toBe('test@example.com');
    expect(updated.name).toBe('Jane Doe');
  });

  it('creates user with role', () => {
    const user = User.create('user-123', 'test@example.com', 'John Doe', 'admin');

    expect(user.role).toBe('admin');
  });

  it('isAdmin returns true for admin role', () => {
    const user = User.create('user-123', 'test@example.com', 'John Doe', 'admin');

    expect(user.isAdmin()).toBe(true);
  });

  it('isAdmin returns false for student role', () => {
    const user = User.create('user-123', 'test@example.com', 'John Doe', 'student');

    expect(user.isAdmin()).toBe(false);
  });
});
