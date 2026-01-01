export type HealthStatus = 'healthy' | 'unhealthy';
export type DatabaseStatus = 'connected' | 'disconnected';

export class Health {
  private constructor(
    private readonly healthStatus: HealthStatus,
    private readonly databaseStatus: DatabaseStatus
  ) {}

  static create(status: HealthStatus, database: DatabaseStatus): Health {
    return new Health(status, database);
  }

  status(): HealthStatus {
    return this.healthStatus;
  }

  database(): DatabaseStatus {
    return this.databaseStatus;
  }

  isHealthy(): boolean {
    return this.healthStatus === 'healthy' && this.databaseStatus === 'connected';
  }
}
