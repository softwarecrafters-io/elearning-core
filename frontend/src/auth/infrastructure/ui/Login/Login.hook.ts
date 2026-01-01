import { useState } from 'react';
import { Maybe } from '@app/common/src/domain/Maybe';
import type { LoginUseCase } from '../../../application/LoginUseCase';

interface LoginState {
  email: string;
  loading: boolean;
  error: Maybe<Error>;
  otpSent: boolean;
}

const initialState: LoginState = {
  email: '',
  loading: false,
  error: Maybe.none(),
  otpSent: false,
};

export function useLogin(useCase: LoginUseCase) {
  const [state, setState] = useState<LoginState>(initialState);

  const setEmail = (email: string) => {
    setState((s) => ({ ...s, email }));
  };

  const requestOTP = async (): Promise<boolean> => {
    setState((s) => ({ ...s, loading: true, error: Maybe.none() }));
    try {
      await useCase.execute(state.email);
      setState((s) => ({ ...s, loading: false, otpSent: true }));
      return true;
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: Maybe.some(error as Error) }));
      return false;
    }
  };

  return {
    email: state.email,
    loading: state.loading,
    error: state.error,
    otpSent: state.otpSent,
    setEmail,
    requestOTP,
  };
}
