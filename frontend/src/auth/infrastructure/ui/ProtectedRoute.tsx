import { Navigate } from 'react-router-dom';
import { Factory } from '../../../shared/infrastructure/factory';
import { Routes } from '../../../shared/infrastructure/ui/routes';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute(props: Props) {
  const tokenStorage = Factory.createTokenStorage();
  const hasToken = tokenStorage.getAccessToken().isSome();
  if (!hasToken) {
    return <Navigate to={Routes.Login} replace />;
  }
  return <>{props.children}</>;
}
