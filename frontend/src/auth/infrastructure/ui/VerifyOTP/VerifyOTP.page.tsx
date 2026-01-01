import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { VerifyOTP } from './VerifyOTP';
import { Factory } from '../../../../shared/infrastructure/factory';
import { Routes } from '../../../../shared/infrastructure/ui/routes';

export function VerifyOTPPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const useCase = useMemo(() => Factory.createVerifyOTPUseCase(), []);
  const isAuthenticated = useMemo(() => Factory.createTokenStorage().getAccessToken().isSome(), []);

  useEffect(() => {
    if (!isAuthenticated && !email) {
      navigate(Routes.Login);
    }
  }, [isAuthenticated, email, navigate]);

  const handleSuccess = () => {
    navigate(Routes.Profile);
  };

  if (isAuthenticated) {
    return <Navigate to={Routes.Profile} replace />;
  }
  if (!email) {
    return null;
  }
  return <VerifyOTP useCase={useCase} email={email} onSuccess={handleSuccess} />;
}
