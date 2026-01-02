import { useEffect } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, useNavigate } from 'react-router-dom';
import { HealthPage } from '../../../../health/infrastructure/ui/Health/Health.page';
import { LoginPage } from '../../../../auth/infrastructure/ui/Login/Login.page';
import { VerifyOTPPage } from '../../../../auth/infrastructure/ui/VerifyOTP/VerifyOTP.page';
import { ProfilePage } from '../../../../auth/infrastructure/ui/Profile/Profile.page';
import { UsersPage } from '../../../../auth/infrastructure/ui/Users/Users.page';
import { ProtectedRoute } from '../ProtectedRoute/ProtectedRoute';
import { ProtectedAdminRoute } from '../ProtectedAdminRoute/ProtectedAdminRoute';
import { HomePage } from '../Home/Home.page';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { Routes } from '../routes';
import { Factory } from '../../factory';
import './App.css';

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    const tokenRefreshScheduler = Factory.createTokenRefreshScheduler();
    tokenRefreshScheduler.start();
    const unsubscribe = tokenRefreshScheduler.onSessionExpired(() => {
      navigate(Routes.Login);
    });
    return () => {
      unsubscribe();
      tokenRefreshScheduler.stop();
    };
  }, [navigate]);

  return (
    <>
      <ThemeToggle />
      <RouterRoutes>
        <Route path={Routes.Home} element={<HomePage />} />
        <Route path={Routes.Health} element={<HealthPage />} />
        <Route path={Routes.Login} element={<LoginPage />} />
        <Route path={Routes.Verify} element={<VerifyOTPPage />} />
        <Route
          path={Routes.Profile}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={Routes.AdminUsers}
          element={
            <ProtectedAdminRoute>
              <UsersPage />
            </ProtectedAdminRoute>
          }
        />
      </RouterRoutes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
