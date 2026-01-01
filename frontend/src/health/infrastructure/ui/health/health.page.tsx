import { Health } from './Health';
import { Factory } from '../../../../shared/infrastructure/factory';

export function HealthPage() {
  const useCase = Factory.createHealthUseCase();
  return <Health useCase={useCase} />;
}
