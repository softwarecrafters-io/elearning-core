import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../value-objects/Email';

export class User {
  private constructor(
    readonly id: Id,
    readonly email: Email,
    private name: string
  ) {}

  static create(email: Email, name: string): User {
    return new User(Id.generate(), email, name);
  }

  static reconstitute(id: Id, email: Email, name: string): User {
    return new User(id, email, name);
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

  toPrimitives(): { id: string; email: string; name: string } {
    return {
      id: this.id.value,
      email: this.email.value,
      name: this.name,
    };
  }
}
