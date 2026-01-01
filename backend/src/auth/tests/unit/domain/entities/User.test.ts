import { User } from '../../../../domain/entities/User';
import { Email } from '../../../../domain/value-objects/Email';
import { Id } from '../../../../../shared/domain/value-objects/Id';

describe('The User', () => {
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

    const user = User.reconstitute(id, email, name);

    expect(user.id.equals(id)).toBe(true);
    expect(user.getName()).toBe(name);
  });

  it('considers two users with same id as equal', () => {
    const id = Id.create('user-123');
    const user1 = User.reconstitute(id, Email.create('test@example.com'), 'John');
    const user2 = User.reconstitute(id, Email.create('other@example.com'), 'Jane');

    expect(user1.equals(user2)).toBe(true);
  });

  it('can be converted to primitives', () => {
    const id = Id.create('user-123');
    const email = Email.create('test@example.com');
    const name = 'John Doe';
    const user = User.reconstitute(id, email, name);

    const primitives = user.toPrimitives();

    expect(primitives).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'John Doe',
    });
  });
});
