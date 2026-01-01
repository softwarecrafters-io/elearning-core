import { Health } from '../../../domain/entities/Health';
import { InMemoryHealthRepository } from '../../../domain/repositories/HealthRepository';
import { HealthUseCase } from '../../../application/HealthUseCase';

describe('The HealthUseCase', () => {
  it('returns healthy DTO when system is healthy', async () => {
    const health = Health.create('healthy', 'connected');
    const repository = new InMemoryHealthRepository(health);
    const useCase = new HealthUseCase(repository);

    const result = await useCase.execute();

    expect(result.status).toBe('healthy');
    expect(result.database).toBe('connected');
    expect(result.isHealthy).toBe(true);
  });

  it('returns unhealthy DTO when database is disconnected', async () => {
    const health = Health.create('healthy', 'disconnected');
    const repository = new InMemoryHealthRepository(health);
    const useCase = new HealthUseCase(repository);

    const result = await useCase.execute();

    expect(result.status).toBe('healthy');
    expect(result.database).toBe('disconnected');
    expect(result.isHealthy).toBe(false);
  });

  it('returns unhealthy DTO when status is unhealthy', async () => {
    const health = Health.create('unhealthy', 'connected');
    const repository = new InMemoryHealthRepository(health);
    const useCase = new HealthUseCase(repository);

    const result = await useCase.execute();

    expect(result.status).toBe('unhealthy');
    expect(result.isHealthy).toBe(false);
  });
});
