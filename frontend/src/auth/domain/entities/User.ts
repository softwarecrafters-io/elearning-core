export class User {
  private constructor(
    readonly id: string,
    readonly email: string,
    readonly name: string,
    readonly role: string
  ) {}

  static create(id: string, email: string, name: string, role: string): User {
    return new User(id, email, name, role);
  }

  updateName(newName: string): User {
    return new User(this.id, this.email, newName, this.role);
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }
}
