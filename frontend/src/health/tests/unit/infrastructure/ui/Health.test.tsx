import { render, screen, waitFor } from '@testing-library/react';
import { Health as HealthEntity } from '../../../../domain/entities/Health';
import { InMemoryHealthRepository } from '../../../../domain/repositories/HealthRepository';
import { HealthUseCase } from '../../../../application/HealthUseCase';
import { Health } from '../../../../infrastructure/ui/Health/Health';

describe('The Health Status Display', () => {
  it('shows loading indicator while checking status', async () => {
    const health = HealthEntity.create('healthy', 'connected');
    const repository = new InMemoryHealthRepository(health);
    const useCase = new HealthUseCase(repository);

    render(<Health useCase={useCase} />);

    expect(screen.getByText('Checking health...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Checking health...')).not.toBeInTheDocument();
    });
  });

  it('displays healthy status when system is operational', async () => {
    const health = HealthEntity.create('healthy', 'connected');
    const repository = new InMemoryHealthRepository(health);
    const useCase = new HealthUseCase(repository);

    render(<Health useCase={useCase} />);

    await waitFor(() => {
      expect(screen.getByText('healthy')).toBeInTheDocument();
    });
  });

  it('displays unhealthy status when database is disconnected', async () => {
    const health = HealthEntity.create('unhealthy', 'disconnected');
    const repository = new InMemoryHealthRepository(health);
    const useCase = new HealthUseCase(repository);

    render(<Health useCase={useCase} />);

    await waitFor(() => {
      expect(screen.getByText('unhealthy')).toBeInTheDocument();
    });
  });

  it('displays error message when health check fails', async () => {
    const failingRepository = {
      async check(): Promise<HealthEntity> {
        throw new Error('Network error');
      },
    };
    const useCase = new HealthUseCase(failingRepository);

    render(<Health useCase={useCase} />);

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });
});
