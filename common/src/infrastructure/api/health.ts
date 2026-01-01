export interface HealthResponse {
  id: string;
  status: 'healthy' | 'unhealthy';
  createdAt: string;
  lastCheckedAt: string;
}
