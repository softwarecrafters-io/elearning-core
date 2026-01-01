import { useState, useCallback } from 'react';
import { Maybe } from '@app/common/src/domain/Maybe';
import type { GetProfileUseCase } from '../../../application/GetProfileUseCase';
import type { UpdateProfileUseCase } from '../../../application/UpdateProfileUseCase';
import type { LogoutUseCase } from '../../../application/LogoutUseCase';
import type { UserDTO } from '../../../application/AuthDTO';

interface ProfileState {
  user: Maybe<UserDTO>;
  loading: boolean;
  error: Maybe<Error>;
  editing: boolean;
  editName: string;
}

const initialState: ProfileState = {
  user: Maybe.none(),
  loading: false,
  error: Maybe.none(),
  editing: false,
  editName: '',
};

export function useProfile(
  getProfileUseCase: GetProfileUseCase,
  updateProfileUseCase: UpdateProfileUseCase,
  logoutUseCase: LogoutUseCase
) {
  const [state, setState] = useState<ProfileState>(initialState);

  const loadProfile = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: Maybe.none() }));
    try {
      const user = await getProfileUseCase.execute();
      setState((s) => ({ ...s, loading: false, user: Maybe.some(user), editName: user.name }));
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: Maybe.some(error as Error) }));
    }
  }, [getProfileUseCase]);

  const startEditing = () => {
    setState((s) => ({ ...s, editing: true }));
  };

  const cancelEditing = () => {
    setState((s) => ({
      ...s,
      editing: false,
      editName: s.user.fold(
        () => '',
        (u) => u.name
      ),
    }));
  };

  const setEditName = (name: string) => {
    setState((s) => ({ ...s, editName: name }));
  };

  const saveProfile = async () => {
    setState((s) => ({ ...s, loading: true, error: Maybe.none() }));
    try {
      const user = await updateProfileUseCase.execute(state.editName);
      setState((s) => ({ ...s, loading: false, user: Maybe.some(user), editing: false }));
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: Maybe.some(error as Error) }));
    }
  };

  const logout = () => {
    logoutUseCase.execute();
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    editing: state.editing,
    editName: state.editName,
    loadProfile,
    startEditing,
    cancelEditing,
    setEditName,
    saveProfile,
    logout,
  };
}
