import { Health } from '../entities/Health';

export interface HealthRepository {
  check(): Promise<Health>;
}

export class InMemoryHealthRepository implements HealthRepository {
  constructor(private readonly health: Health) {}

  async check(): Promise<Health> {
    return this.health;
  }
}
