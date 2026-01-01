import { HealthUseCase } from '../../application/HealthUseCase';
import { InMemoryHealthRepository } from '../../domain/repositories/HealthRepository';
import { Health } from '../../domain/entities/Health';
import { Id } from '../../../shared/domain/value-objects/Id';

describe('The HealthUseCase', () => {
  it('reports the system as healthy', async () => {
    const repository = new InMemoryHealthRepository();
    const useCase = new HealthUseCase(repository);

    const result = await useCase.execute();

    expect(result.status).toBe('healthy');
  });

  it('remembers when the system was first checked', async () => {
    const repository = new InMemoryHealthRepository();
    const useCase = new HealthUseCase(repository);

    await useCase.execute();

    const saved = await repository.find();
    expect(saved.isSome()).toBe(true);
  });

  it('tracks uptime from the first check', async () => {
    const id = Id.generate();
    const now = new Date();
    const existing = Health.create(id, now, now);
    const repository = new InMemoryHealthRepository(existing);
    const useCase = new HealthUseCase(repository);

    const result = await useCase.execute();

    expect(result.id).toBe(id.value);
    expect(result.status).toBe('healthy');
  });
});
