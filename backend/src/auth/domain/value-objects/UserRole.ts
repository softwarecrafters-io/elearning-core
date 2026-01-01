import { DomainError } from '@app/common/src/domain/DomainError';

type UserRoleValue = 'admin' | 'student';

export class UserRole {
  private static readonly validRoles: UserRoleValue[] = ['admin', 'student'];

  private constructor(readonly value: UserRoleValue) {}

  static create(value: string): UserRole {
    if (!UserRole.validRoles.includes(value as UserRoleValue)) {
      throw DomainError.createValidation('Invalid role');
    }
    return new UserRole(value as UserRoleValue);
  }
}
