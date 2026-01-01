import { Health } from '../../../../domain/entities/Health';

describe('The Health entity', () => {
  it('is healthy when status is healthy and database is connected', () => {
    const health = Health.create('healthy', 'connected');

    expect(health.isHealthy()).toBe(true);
  });

  it('is not healthy when status is unhealthy', () => {
    const health = Health.create('unhealthy', 'connected');

    expect(health.isHealthy()).toBe(false);
  });

  it('is not healthy when database is disconnected', () => {
    const health = Health.create('healthy', 'disconnected');

    expect(health.isHealthy()).toBe(false);
  });

  it('returns the status', () => {
    const health = Health.create('healthy', 'connected');

    expect(health.status()).toBe('healthy');
  });

  it('returns the database status', () => {
    const health = Health.create('healthy', 'connected');

    expect(health.database()).toBe('connected');
  });
});
