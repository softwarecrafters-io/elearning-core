import { Link } from 'react-router-dom';
import { Routes } from '../routes';
import styles from './Home.module.css';

export function HomePage() {
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
      </nav>
    </div>
  );
}
