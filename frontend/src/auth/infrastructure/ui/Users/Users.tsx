import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from './Users.hook';
import type { ListUsersUseCase } from '../../../application/ListUsersUseCase';
import type { AdminCreateUserUseCase } from '../../../application/AdminCreateUserUseCase';
import type { AdminUpdateUserUseCase } from '../../../application/AdminUpdateUserUseCase';
import type { AdminDeleteUserUseCase } from '../../../application/AdminDeleteUserUseCase';
import type { UserDTO } from '../../../application/AuthDTO';
import { Routes } from '../../../../shared/infrastructure/ui/routes';
import styles from './Users.module.css';

interface Props {
  listUsersUseCase: ListUsersUseCase;
  createUserUseCase: AdminCreateUserUseCase;
  updateUserUseCase: AdminUpdateUserUseCase;
  deleteUserUseCase: AdminDeleteUserUseCase;
}

interface UserRowProps {
  user: UserDTO;
  editingUserId: string | null;
  editName: string;
  loading: boolean;
  onEditNameChange: (name: string) => void;
  onStartEditing: (user: UserDTO) => void;
  onCancelEditing: () => void;
  onUpdateUser: () => void;
  onDeleteUser: (userId: string) => void;
}

function UserRow({
  user,
  editingUserId,
  editName,
  loading,
  onEditNameChange,
  onStartEditing,
  onCancelEditing,
  onUpdateUser,
  onDeleteUser,
}: UserRowProps) {
  const isEditing = editingUserId === user.id;
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser();
  };
  return (
    <tr>
      <td>{user.email}</td>
      <td>
        {isEditing ? (
          <form onSubmit={handleUpdateSubmit} style={{ display: 'inline' }}>
            <input
              type="text"
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className={styles.editInput}
              autoFocus
            />
          </form>
        ) : (
          user.name || '-'
        )}
      </td>
      <td>
        <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeAdmin : styles.badgeStudent}`}>
          {user.role}
        </span>
      </td>
      <td>
        <div className={styles.actions}>
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={onUpdateUser}
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={loading}
              >
                Save
              </button>
              <button type="button" onClick={onCancelEditing} className={`${styles.button} ${styles.buttonSecondary}`}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onStartEditing(user)}
                className={`${styles.buttonIcon}`}
                title="Edit"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => onDeleteUser(user.id)}
                className={`${styles.buttonIcon} ${styles.buttonIconDanger}`}
                disabled={loading}
                title="Delete"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export function Users(props: Props) {
  const hook = useUsers(
    props.listUsersUseCase,
    props.createUserUseCase,
    props.updateUserUseCase,
    props.deleteUserUseCase
  );

  useEffect(() => {
    hook.loadUsers();
  }, []);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hook.createUser();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Management</h1>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>Users</span>
          <button type="button" onClick={hook.toggleCreateForm} className={`${styles.button} ${styles.buttonPrimary}`}>
            {hook.showCreateForm ? 'Cancel' : 'Add User'}
          </button>
        </div>
        {hook.showCreateForm && (
          <form className={styles.createForm} onSubmit={handleCreateSubmit}>
            <div className={styles.formRow}>
              <input
                type="email"
                placeholder="Email"
                value={hook.newUserEmail}
                onChange={(e) => hook.setNewUserEmail(e.target.value)}
                className={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Name"
                value={hook.newUserName}
                onChange={(e) => hook.setNewUserName(e.target.value)}
                className={styles.input}
              />
              <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={hook.loading}>
                Create
              </button>
            </div>
          </form>
        )}
        {hook.error.isSome() && <p className={styles.error}>{hook.error.getOrThrow().message}</p>}
        {hook.loading && hook.users.length === 0 ? (
          <p className={styles.loading}>Loading users...</p>
        ) : hook.users.length === 0 ? (
          <p className={styles.empty}>No users found</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hook.users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  editingUserId={hook.editingUserId}
                  editName={hook.editName}
                  loading={hook.loading}
                  onEditNameChange={hook.setEditName}
                  onStartEditing={hook.startEditing}
                  onCancelEditing={hook.cancelEditing}
                  onUpdateUser={hook.updateUser}
                  onDeleteUser={hook.deleteUser}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Link to={Routes.Home} className={styles.link}>
        Back to Home
      </Link>
    </div>
  );
}
