import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Routes } from '../routes';
import { Factory } from '../../factory';
import styles from './Home.module.css';

export function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const tokenStorage = Factory.createTokenStorage();
      if (tokenStorage.getAccessToken().isNone()) {
        setIsAdmin(false);
        return;
      }
      try {
        const getProfileUseCase = Factory.createGetProfileUseCase();
        const profile = await getProfileUseCase.execute();
        setIsAdmin(profile.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Email-based Login</h1>
      <nav className={styles.nav}>
        <Link to={Routes.Login} className={styles.link}>
          Login
        </Link>
        <Link to={Routes.Profile} className={styles.link}>
          Profile
        </Link>
        <Link to={Routes.Health} className={styles.link}>
          Health Status
        </Link>
        {isAdmin && (
          <Link to={Routes.AdminUsers} className={styles.link}>
            Admin Users
          </Link>
        )}
      </nav>
    </div>
  );
}
