import { AdminUsers } from './AdminUsers';
import { Factory } from '../../../../shared/infrastructure/factory';

export function AdminUsersPage() {
  const listUsersUseCase = Factory.createListUsersUseCase();
  const createUserUseCase = Factory.createAdminCreateUserUseCase();
  const updateUserUseCase = Factory.createAdminUpdateUserUseCase();
  const deleteUserUseCase = Factory.createAdminDeleteUserUseCase();

  return (
    <AdminUsers
      listUsersUseCase={listUsersUseCase}
      createUserUseCase={createUserUseCase}
      updateUserUseCase={updateUserUseCase}
      deleteUserUseCase={deleteUserUseCase}
    />
  );
}
