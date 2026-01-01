import { useEffect } from 'react';
import { useHealth } from './Health.hook';
import { HealthUseCase } from '../../../application/HealthUseCase';
import styles from './Health.module.css';

interface Props {
  useCase: HealthUseCase;
}

export function Health(props: Props) {
  const hook = useHealth(props.useCase);

  useEffect(() => {
    hook.loadHealthStatus();
  }, [hook.loadHealthStatus]);

  if (hook.isLoading) {
    return <div className={styles.loading}>Checking health...</div>;
  }

  if (hook.hasError) {
    return <div className={styles.error}>Error: {hook.errorMessage}</div>;
  }

  return hook.health.fold(
    () => <div className={styles.empty}>No health data</div>,
    (health) => (
      <div className={styles.container}>
        <span className={health.isHealthy ? styles.healthy : styles.unhealthy}>{health.status}</span>
      </div>
    )
  );
}
