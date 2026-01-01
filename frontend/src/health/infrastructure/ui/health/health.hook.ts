import { useState, useCallback } from 'react';
import { Maybe } from '@app/common/src/domain/Maybe';
import { HealthUseCase } from '../../../application/HealthUseCase';
import type { HealthDTO } from '../../../application/HealthDTO';

interface HealthState {
  health: Maybe<HealthDTO>;
  loading: boolean;
  error: Maybe<Error>;
}

const initialState: HealthState = {
  health: Maybe.none(),
  loading: false,
  error: Maybe.none(),
};

export function useHealth(useCase: HealthUseCase) {
  const [state, setState] = useState<HealthState>(initialState);

  const loadHealthStatus = useCallback(async () => {
    setState({ health: Maybe.none(), loading: true, error: Maybe.none() });
    try {
      const health = await useCase.execute();
      setState({ health: Maybe.some(health), loading: false, error: Maybe.none() });
    } catch (error) {
      setState({ health: Maybe.none(), loading: false, error: Maybe.some(error as Error) });
    }
  }, [useCase]);

  return {
    loadHealthStatus,
    isLoading: state.loading,
    hasError: state.error.isSome(),
    errorMessage: state.error.isSome() ? state.error.getOrThrow().message : '',
    health: state.health,
  };
}
