import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Factory } from '../../factory';
import { Routes } from '../routes';

type AuthState = 'checking' | 'admin' | 'not-admin' | 'unauthenticated';

interface Props {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: Props) {
  const [authState, setAuthState] = useState<AuthState>('checking');

  useEffect(() => {
    const checkAdminAccess = async () => {
      const tokenStorage = Factory.createTokenStorage();
      const hasToken = tokenStorage.getAccessToken().isSome();
      if (!hasToken) {
        setAuthState('unauthenticated');
        return;
      }
      try {
        const getProfileUseCase = Factory.createGetProfileUseCase();
        const profile = await getProfileUseCase.execute();
        setAuthState(profile.role === 'admin' ? 'admin' : 'not-admin');
      } catch {
        setAuthState('unauthenticated');
      }
    };
    checkAdminAccess();
  }, []);

  if (authState === 'checking') {
    return null;
  }
  if (authState === 'unauthenticated') {
    return <Navigate to={Routes.Login} replace />;
  }
  if (authState === 'not-admin') {
    return <Navigate to={Routes.Home} replace />;
  }
  return <>{children}</>;
}
