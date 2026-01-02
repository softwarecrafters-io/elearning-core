import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from './Profile.hook';
import type { GetProfileUseCase } from '../../../application/GetProfileUseCase';
import type { UpdateProfileUseCase } from '../../../application/UpdateProfileUseCase';
import type { LogoutUseCase } from '../../../application/LogoutUseCase';
import { Routes } from '../../../../shared/infrastructure/ui/routes';
import styles from './Profile.module.css';

interface Props {
  getProfileUseCase: GetProfileUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
  logoutUseCase: LogoutUseCase;
  onLogout: () => void;
}

export function Profile(props: Props) {
  const hook = useProfile(props.getProfileUseCase, props.updateProfileUseCase, props.logoutUseCase);

  useEffect(() => {
    hook.loadProfile();
  }, [hook.loadProfile]);

  const handleLogout = () => {
    hook.logout();
    props.onLogout();
  };

  if (hook.loading && hook.user.isNone()) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Loading profile...</p>
      </div>
    );
  }

  if (hook.error.isSome() && hook.user.isNone()) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{hook.error.getOrThrow().message}</p>
        <Link to={Routes.Login} className={styles.link}>
          Go to Login
        </Link>
      </div>
    );
  }

  return hook.user.fold(
    () => null,
    (user) => (
      <div className={styles.container}>
        <h1 className={styles.title}>Profile</h1>
        <div className={styles.card}>
          <div className={styles.field}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{user.email}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Role</span>
            <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeAdmin : styles.badgeStudent}`}>
              {user.role}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Name</span>
            {hook.editing ? (
              <input
                type="text"
                value={hook.editName}
                onChange={(e) => hook.setEditName(e.target.value)}
                className={styles.input}
                disabled={hook.loading}
              />
            ) : (
              <span className={styles.value}>{user.name || 'Not set'}</span>
            )}
          </div>
          {hook.error.isSome() && <p className={styles.error}>{hook.error.getOrThrow().message}</p>}
          <div className={styles.actions}>
            {hook.editing ? (
              <>
                <button
                  type="button"
                  onClick={hook.saveProfile}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={hook.loading}
                >
                  {hook.loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={hook.cancelEditing}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  disabled={hook.loading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={hook.startEditing}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  Edit Name
                </button>
                <button type="button" onClick={handleLogout} className={`${styles.button} ${styles.buttonDanger}`}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
        <Link to={Routes.Home} className={styles.link}>
          Back to Home
        </Link>
      </div>
    )
  );
}
