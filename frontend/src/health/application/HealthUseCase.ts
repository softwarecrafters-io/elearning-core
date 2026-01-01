import type { HealthRepository } from '../domain/repositories/HealthRepository';
import type { HealthDTO } from './HealthDTO';

export class HealthUseCase {
  constructor(private readonly healthRepository: HealthRepository) {}

  async execute(): Promise<HealthDTO> {
    const health = await this.healthRepository.check();
    return {
      status: health.status(),
      database: health.database(),
      isHealthy: health.isHealthy(),
    };
  }
}
