import { Id } from '../../../shared/domain/value-objects/Id';
import { DomainError } from '@app/common/src/domain/DomainError';

export class Health {
  private constructor(
    private readonly id: Id,
    private readonly createdAt: Date,
    private lastCheckedAt: Date
  ) {}

  static create(id: Id, createdAt: Date, lastCheckedAt: Date): Health {
    if (lastCheckedAt < createdAt) {
      throw DomainError.createValidation('lastCheckedAt cannot be before createdAt');
    }
    return new Health(id, createdAt, lastCheckedAt);
  }

  uptime(): number {
    return (this.lastCheckedAt.getTime() - this.createdAt.getTime()) / 1000;
  }

  update(now: Date): void {
    if (now < this.createdAt) {
      throw DomainError.createValidation('lastCheckedAt cannot be before createdAt');
    }
    this.lastCheckedAt = now;
  }

  equals(other: Health): boolean {
    return (
      this.id.equals(other.id) &&
      this.createdAt.getTime() === other.createdAt.getTime() &&
      this.lastCheckedAt.getTime() === other.lastCheckedAt.getTime()
    );
  }

  toPrimitives() {
    return {
      id: this.id.value,
      createdAt: this.createdAt.toISOString(),
      lastCheckedAt: this.lastCheckedAt.toISOString(),
    };
  }
}
