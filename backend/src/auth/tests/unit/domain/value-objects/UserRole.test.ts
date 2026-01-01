import { UserRole } from '../../../../domain/value-objects/UserRole';

describe('The UserRole', () => {
  it('creates a student role', () => {
    const role = UserRole.create('student');

    expect(role.value).toBe('student');
  });

  it('creates an admin role', () => {
    const role = UserRole.create('admin');

    expect(role.value).toBe('admin');
  });

  it('rejects invalid role value', () => {
    expect(() => UserRole.create('superadmin')).toThrow('Invalid role');
  });

  it('considers two roles with same value as equal', () => {
    const role1 = UserRole.create('admin');
    const role2 = UserRole.create('admin');

    expect(role1.equals(role2)).toBe(true);
  });

  it('considers two roles with different values as not equal', () => {
    const admin = UserRole.create('admin');
    const student = UserRole.create('student');

    expect(admin.equals(student)).toBe(false);
  });

  it('identifies admin role correctly', () => {
    const role = UserRole.create('admin');

    expect(role.isAdmin()).toBe(true);
  });

  it('does not identify student as admin', () => {
    const role = UserRole.create('student');

    expect(role.isAdmin()).toBe(false);
  });

  it('identifies student role correctly', () => {
    const role = UserRole.create('student');

    expect(role.isStudent()).toBe(true);
  });

  it('does not identify admin as student', () => {
    const role = UserRole.create('admin');

    expect(role.isStudent()).toBe(false);
  });
});
