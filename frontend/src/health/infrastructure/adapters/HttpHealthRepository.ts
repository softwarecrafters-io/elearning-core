import type { HealthRepository } from '../../domain/repositories/HealthRepository';
import { Health } from '../../domain/entities/Health';
import type { HttpClient } from '../../../shared/infrastructure/http/HttpClient';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';
import type { HealthResponse } from '@app/common/src/infrastructure/api/health';

export class HttpHealthRepository implements HealthRepository {
  constructor(private httpClient: HttpClient) {}

  async check(): Promise<Health> {
    const data = await this.httpClient.get<HealthResponse>(ApiRoutes.Health);
    const database = data.status === 'healthy' ? 'connected' : 'disconnected';
    return Health.create(data.status, database);
  }
}
