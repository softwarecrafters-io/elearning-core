export interface HealthDTO {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  isHealthy: boolean;
}
