import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Factory } from '../../factory';
import { Routes } from '../routes';

type AuthState = 'checking' | 'authenticated' | 'unauthenticated';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const [authState, setAuthState] = useState<AuthState>('checking');

  useEffect(() => {
    const tokenStorage = Factory.createTokenStorage();
    const hasToken = tokenStorage.getAccessToken().isSome();
    setAuthState(hasToken ? 'authenticated' : 'unauthenticated');
  }, []);

  if (authState === 'checking') {
    return null;
  }
  if (authState === 'unauthenticated') {
    return <Navigate to={Routes.Login} replace />;
  }
  return <>{children}</>;
}
