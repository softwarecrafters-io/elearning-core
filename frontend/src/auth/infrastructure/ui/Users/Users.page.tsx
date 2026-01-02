import { Users } from './Users';
import { Factory } from '../../../../shared/infrastructure/factory';

export function UsersPage() {
  const listUsersUseCase = Factory.createListUsersUseCase();
  const createUserUseCase = Factory.createAdminCreateUserUseCase();
  const updateUserUseCase = Factory.createAdminUpdateUserUseCase();
  const deleteUserUseCase = Factory.createAdminDeleteUserUseCase();

  return (
    <Users
      listUsersUseCase={listUsersUseCase}
      createUserUseCase={createUserUseCase}
      updateUserUseCase={updateUserUseCase}
      deleteUserUseCase={deleteUserUseCase}
    />
  );
}
