import { Health } from '../entities/Health';
import { Maybe } from '@app/common/src/domain/Maybe';

export interface HealthRepository {
  save(health: Health): Promise<void>;
  find(): Promise<Maybe<Health>>;
}

export class InMemoryHealthRepository implements HealthRepository {
  private health: Maybe<Health>;

  constructor(initialHealth?: Health) {
    this.health = Maybe.fromNullable(initialHealth);
  }

  async save(health: Health): Promise<void> {
    this.health = Maybe.some(health);
  }

  async find(): Promise<Maybe<Health>> {
    return this.health;
  }
}
