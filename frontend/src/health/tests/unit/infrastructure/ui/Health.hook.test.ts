import { renderHook, act, waitFor } from '@testing-library/react';
import { Health } from '../../../../domain/entities/Health';
import { InMemoryHealthRepository } from '../../../../domain/repositories/HealthRepository';
import { HealthUseCase } from '../../../../application/HealthUseCase';
import { useHealth } from '../../../../infrastructure/ui/Health/Health.hook';

describe('The Health Status', () => {
  it('initializes without health data', () => {
    const health = Health.create('healthy', 'connected');
    const repository = new InMemoryHealthRepository(health);
    const useCase = new HealthUseCase(repository);

    const { result } = renderHook(() => useHealth(useCase));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
    expect(result.current.health.isNone()).toBe(true);
  });

  it('provides health data after checking status', async () => {
    const health = Health.create('healthy', 'connected');
    const repository = new InMemoryHealthRepository(health);
    const useCase = new HealthUseCase(repository);
    const { result } = renderHook(() => useHealth(useCase));

    await act(async () => {
      await result.current.loadHealthStatus();
    });

    expect(result.current.health.isSome()).toBe(true);
    const healthData = result.current.health.getOrThrow();
    expect(healthData.status).toBe('healthy');
    expect(healthData.isHealthy).toBe(true);
  });

  it('indicates loading while checking health status', async () => {
    const health = Health.create('healthy', 'connected');
    const repository = new InMemoryHealthRepository(health);
    const useCase = new HealthUseCase(repository);
    const { result } = renderHook(() => useHealth(useCase));

    act(() => {
      result.current.loadHealthStatus();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('reports error when health check fails', async () => {
    const failingRepository = {
      async check(): Promise<Health> {
        throw new Error('Connection failed');
      },
    };
    const useCase = new HealthUseCase(failingRepository);
    const { result } = renderHook(() => useHealth(useCase));

    await act(async () => {
      await result.current.loadHealthStatus();
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.errorMessage).toBe('Connection failed');
    expect(result.current.health.isNone()).toBe(true);
  });
});
