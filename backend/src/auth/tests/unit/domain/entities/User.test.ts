import { User } from '../../../../domain/entities/User';
import { Email } from '../../../../domain/value-objects/Email';
import { UserRole } from '../../../../domain/value-objects/UserRole';
import { Id } from '../../../../../shared/domain/value-objects/Id';

describe('The User', () => {
  it('creates with student role by default', () => {
    const email = Email.create('test@example.com');

    const user = User.create(email, 'John Doe');

    expect(user.role.isStudent()).toBe(true);
  });

  it('assigns unique id when created', () => {
    const email = Email.create('test@example.com');
    const name = 'John Doe';

    const user = User.create(email, name);

    expect(user.email.equals(email)).toBe(true);
    expect(user.getName()).toBe(name);
    expect(user.id).toBeDefined();
  });

  it('preserves id when reconstituted', () => {
    const id = Id.create('user-123');
    const email = Email.create('test@example.com');
    const name = 'John Doe';
    const role = UserRole.create('student');

    const user = User.reconstitute(id, email, name, role);

    expect(user.id.equals(id)).toBe(true);
    expect(user.getName()).toBe(name);
  });

  it('considers two users with same id as equal', () => {
    const id = Id.create('user-123');
    const role = UserRole.create('student');
    const user1 = User.reconstitute(id, Email.create('test@example.com'), 'John', role);
    const user2 = User.reconstitute(id, Email.create('other@example.com'), 'Jane', role);

    expect(user1.equals(user2)).toBe(true);
  });

  it('can be converted to primitives', () => {
    const id = Id.create('user-123');
    const email = Email.create('test@example.com');
    const name = 'John Doe';
    const role = UserRole.create('student');
    const user = User.reconstitute(id, email, name, role);

    const primitives = user.toPrimitives();

    expect(primitives).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'John Doe',
      role: 'student',
    });
  });
});
