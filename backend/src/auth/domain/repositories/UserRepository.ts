import { Maybe } from '@app/common/src/domain/Maybe';
import { User } from '../entities/User';
import { Email } from '../value-objects/Email';
import { Id } from '../../../shared/domain/value-objects/Id';

export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: Email): Promise<Maybe<User>>;
  findById(id: Id): Promise<Maybe<User>>;
  findAll(): Promise<User[]>;
  delete(id: Id): Promise<void>;
}

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  constructor(initialUsers: User[] = []) {
    initialUsers.forEach((user) => this.users.set(user.email.value, user));
  }

  async save(user: User): Promise<void> {
    this.users.set(user.email.value, user);
  }

  async findByEmail(email: Email): Promise<Maybe<User>> {
    const user = this.users.get(email.value);
    return Maybe.fromNullable(user);
  }

  async findById(id: Id): Promise<Maybe<User>> {
    const user = Array.from(this.users.values()).find((u) => u.id.equals(id));
    return Maybe.fromNullable(user);
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async delete(id: Id): Promise<void> {
    const user = Array.from(this.users.values()).find((u) => u.id.equals(id));
    if (user) {
      this.users.delete(user.email.value);
    }
  }
}
