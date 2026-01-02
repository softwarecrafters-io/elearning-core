import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../value-objects/Email';
import { UserRole } from '../value-objects/UserRole';

export class User {
  private constructor(
    readonly id: Id,
    readonly email: Email,
    private name: string,
    readonly role: UserRole
  ) {}

  static create(email: Email, name: string): User {
    return new User(Id.generate(), email, name, UserRole.create('student'));
  }

  static reconstitute(id: Id, email: Email, name: string, role: UserRole): User {
    return new User(id, email, name, role);
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }

  updateName(newName: string): void {
    this.name = newName;
  }

  getName(): string {
    return this.name;
  }

  toPrimitives(): { id: string; email: string; name: string; role: string } {
    return {
      id: this.id.value,
      email: this.email.value,
      name: this.name,
      role: this.role.value,
    };
  }
}
