import crypto from 'crypto';

export class Id {
  private constructor(readonly value: string) {}

  static create(value: string): Id {
    return new Id(value);
  }

  static generate(): Id {
    return new Id(crypto.randomUUID());
  }

  equals(other: Id): boolean {
    return this.value === other.value;
  }
}
