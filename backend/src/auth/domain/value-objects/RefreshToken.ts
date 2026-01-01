import { DomainError } from '@app/common/src/domain/DomainError';
import { randomUUID } from 'crypto';

export class RefreshToken {
  private constructor(readonly value: string) {}

  static create(value: string): RefreshToken {
    if (!value) {
      throw DomainError.createValidation('RefreshToken cannot be empty');
    }
    return new RefreshToken(value);
  }

  static generate(): RefreshToken {
    return new RefreshToken(randomUUID());
  }

  equals(other: RefreshToken): boolean {
    return this.value === other.value;
  }
}
