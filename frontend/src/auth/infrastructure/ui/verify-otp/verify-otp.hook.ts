import { useState } from 'react';
import { Maybe } from '@app/common/src/domain/Maybe';
import type { VerifyOTPUseCase } from '../../../application/VerifyOTPUseCase';

interface VerifyOTPState {
  code: string;
  loading: boolean;
  error: Maybe<Error>;
  success: boolean;
}

const initialState: VerifyOTPState = {
  code: '',
  loading: false,
  error: Maybe.none(),
  success: false,
};

export function useVerifyOTP(useCase: VerifyOTPUseCase, email: string) {
  const [state, setState] = useState<VerifyOTPState>(initialState);

  const setCode = (code: string) => {
    setState((s) => ({ ...s, code }));
  };

  const verify = async (): Promise<boolean> => {
    setState((s) => ({ ...s, loading: true, error: Maybe.none() }));
    try {
      await useCase.execute(email, state.code);
      setState((s) => ({ ...s, loading: false, success: true }));
      return true;
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: Maybe.some(error as Error) }));
      return false;
    }
  };

  return {
    code: state.code,
    loading: state.loading,
    error: state.error,
    success: state.success,
    setCode,
    verify,
  };
}
