export class UserRole {
  private constructor(readonly value: string) {}

  static create(value: string): UserRole {
    return new UserRole(value);
  }
}
