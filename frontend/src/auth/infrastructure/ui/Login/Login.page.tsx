import { useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Login } from './Login';
import { Factory } from '../../../../shared/infrastructure/factory';
import { Routes } from '../../../../shared/infrastructure/ui/routes';

export function LoginPage() {
  const navigate = useNavigate();
  const useCase = useMemo(() => Factory.createLoginUseCase(), []);
  const isAuthenticated = useMemo(() => Factory.createTokenStorage().getAccessToken().isSome(), []);

  const handleOTPSent = (email: string) => {
    navigate(`${Routes.Verify}?email=${encodeURIComponent(email)}`);
  };

  if (isAuthenticated) {
    return <Navigate to={Routes.Profile} replace />;
  }
  return <Login useCase={useCase} onOTPSent={handleOTPSent} />;
}
