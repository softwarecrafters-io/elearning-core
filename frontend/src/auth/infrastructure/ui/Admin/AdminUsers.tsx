import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminUsers } from './AdminUsers.hook';
import type { ListUsersUseCase } from '../../../application/ListUsersUseCase';
import type { AdminCreateUserUseCase } from '../../../application/AdminCreateUserUseCase';
import type { AdminUpdateUserUseCase } from '../../../application/AdminUpdateUserUseCase';
import type { AdminDeleteUserUseCase } from '../../../application/AdminDeleteUserUseCase';
import { Routes } from '../../../../shared/infrastructure/ui/routes';
import styles from './AdminUsers.module.css';

interface Props {
  listUsersUseCase: ListUsersUseCase;
  createUserUseCase: AdminCreateUserUseCase;
  updateUserUseCase: AdminUpdateUserUseCase;
  deleteUserUseCase: AdminDeleteUserUseCase;
}

export function AdminUsers(props: Props) {
  const hook = useAdminUsers(
    props.listUsersUseCase,
    props.createUserUseCase,
    props.updateUserUseCase,
    props.deleteUserUseCase
  );

  useEffect(() => {
    hook.loadUsers();
  }, [hook.loadUsers]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hook.createUser();
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hook.updateUser();
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
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    {hook.editingUserId === user.id ? (
                      <form onSubmit={handleUpdateSubmit} style={{ display: 'inline' }}>
                        <input
                          type="text"
                          value={hook.editName}
                          onChange={(e) => hook.setEditName(e.target.value)}
                          className={styles.editInput}
                          autoFocus
                        />
                      </form>
                    ) : (
                      user.name || '-'
                    )}
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${user.role === 'admin' ? styles.badgeAdmin : styles.badgeStudent}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {hook.editingUserId === user.id ? (
                        <>
                          <button
                            type="button"
                            onClick={hook.updateUser}
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            disabled={hook.loading}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={hook.cancelEditing}
                            className={`${styles.button} ${styles.buttonSecondary}`}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => hook.startEditing(user)}
                            className={`${styles.buttonIcon}`}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => hook.deleteUser(user.id)}
                            className={`${styles.buttonIcon} ${styles.buttonIconDanger}`}
                            disabled={hook.loading}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
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
