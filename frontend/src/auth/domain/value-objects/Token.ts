import { DomainError } from '@app/common/src/domain/DomainError';

export class Token {
  private constructor(readonly value: string) {}

  static create(value: string): Token {
    if (!value || value.trim() === '') {
      throw DomainError.createValidation('Token cannot be empty');
    }
    return new Token(value);
  }

  equals(other: Token): boolean {
    return this.value === other.value;
  }
}
