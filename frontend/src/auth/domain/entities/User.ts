export class User {
  private constructor(
    readonly id: string,
    readonly email: string,
    readonly name: string
  ) {}

  static create(id: string, email: string, name: string): User {
    return new User(id, email, name);
  }

  updateName(newName: string): User {
    return new User(this.id, this.email, newName);
  }
}
