import { UserRole } from '../../../../domain/value-objects/UserRole';

describe('The UserRole', () => {
  // TODO: creates a student role
  // TODO: creates an admin role
  // TODO: rejects invalid role value
  // TODO: equals returns true for same role
  // TODO: equals returns false for different roles
  // TODO: isAdmin returns true for admin
  // TODO: isAdmin returns false for student
  // TODO: isStudent returns true for student
  // TODO: isStudent returns false for admin

  it('creates a student role', () => {
    const role = UserRole.create('student');

    expect(role.value).toBe('student');
  });
});
