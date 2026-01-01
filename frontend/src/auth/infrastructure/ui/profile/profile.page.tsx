import { useNavigate } from 'react-router-dom';
import { Profile } from './Profile';
import { Factory } from '../../../../shared/infrastructure/factory';
import { Routes } from '../../../../shared/infrastructure/ui/routes';

export function ProfilePage() {
  const navigate = useNavigate();
  const getProfileUseCase = Factory.createGetProfileUseCase();
  const updateProfileUseCase = Factory.createUpdateProfileUseCase();
  const logoutUseCase = Factory.createLogoutUseCase();

  const handleLogout = () => {
    navigate(Routes.Login);
  };

  return (
    <Profile
      getProfileUseCase={getProfileUseCase}
      updateProfileUseCase={updateProfileUseCase}
      logoutUseCase={logoutUseCase}
      onLogout={handleLogout}
    />
  );
}
