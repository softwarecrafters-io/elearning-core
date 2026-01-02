import { useState } from 'react';
import { Maybe } from '@app/common/src/domain/Maybe';
import type { ListUsersUseCase } from '../../../application/ListUsersUseCase';
import type { AdminCreateUserUseCase } from '../../../application/AdminCreateUserUseCase';
import type { AdminUpdateUserUseCase } from '../../../application/AdminUpdateUserUseCase';
import type { AdminDeleteUserUseCase } from '../../../application/AdminDeleteUserUseCase';
import type { UserDTO } from '../../../application/AuthDTO';

interface UsersState {
  users: UserDTO[];
  loading: boolean;
  error: Maybe<Error>;
  editingUserId: string | null;
  editName: string;
  newUserEmail: string;
  newUserName: string;
  showCreateForm: boolean;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: Maybe.none(),
  editingUserId: null,
  editName: '',
  newUserEmail: '',
  newUserName: '',
  showCreateForm: false,
};

export function useUsers(
  listUsersUseCase: ListUsersUseCase,
  createUserUseCase: AdminCreateUserUseCase,
  updateUserUseCase: AdminUpdateUserUseCase,
  deleteUserUseCase: AdminDeleteUserUseCase
) {
  const [state, setState] = useState<UsersState>(initialState);

  const loadUsers = async () => {
    setState((s) => ({ ...s, loading: true, error: Maybe.none() }));
    try {
      const users = await listUsersUseCase.execute();
      setState((s) => ({ ...s, loading: false, users }));
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: Maybe.some(error as Error) }));
    }
  };

  const createUser = async () => {
    if (!state.newUserEmail.trim()) return;
    setState((s) => ({ ...s, loading: true, error: Maybe.none() }));
    try {
      await createUserUseCase.execute(state.newUserEmail, state.newUserName);
      setState((s) => ({ ...s, newUserEmail: '', newUserName: '', showCreateForm: false }));
      await loadUsers();
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: Maybe.some(error as Error) }));
    }
  };

  const startEditing = (user: UserDTO) => {
    setState((s) => ({ ...s, editingUserId: user.id, editName: user.name }));
  };

  const cancelEditing = () => {
    setState((s) => ({ ...s, editingUserId: null, editName: '' }));
  };

  const updateUser = async () => {
    if (!state.editingUserId) return;
    setState((s) => ({ ...s, loading: true, error: Maybe.none() }));
    try {
      await updateUserUseCase.execute(state.editingUserId, state.editName);
      setState((s) => ({ ...s, editingUserId: null, editName: '' }));
      await loadUsers();
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: Maybe.some(error as Error) }));
    }
  };

  const deleteUser = async (userId: string) => {
    setState((s) => ({ ...s, loading: true, error: Maybe.none() }));
    try {
      await deleteUserUseCase.execute(userId);
      await loadUsers();
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: Maybe.some(error as Error) }));
    }
  };

  const setEditName = (name: string) => {
    setState((s) => ({ ...s, editName: name }));
  };

  const setNewUserEmail = (email: string) => {
    setState((s) => ({ ...s, newUserEmail: email }));
  };

  const setNewUserName = (name: string) => {
    setState((s) => ({ ...s, newUserName: name }));
  };

  const toggleCreateForm = () => {
    setState((s) => ({ ...s, showCreateForm: !s.showCreateForm, newUserEmail: '', newUserName: '' }));
  };

  return {
    users: state.users,
    loading: state.loading,
    error: state.error,
    editingUserId: state.editingUserId,
    editName: state.editName,
    newUserEmail: state.newUserEmail,
    newUserName: state.newUserName,
    showCreateForm: state.showCreateForm,
    loadUsers,
    createUser,
    startEditing,
    cancelEditing,
    updateUser,
    deleteUser,
    setEditName,
    setNewUserEmail,
    setNewUserName,
    toggleCreateForm,
  };
}
