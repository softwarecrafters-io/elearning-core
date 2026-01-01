import { DomainError } from '@app/common/src/domain/DomainError';

export class Email {
  private constructor(readonly value: string) {}

  static create(value: string): Email {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw DomainError.createValidation('Invalid email format');
    }
    return new Email(value.toLowerCase());
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
