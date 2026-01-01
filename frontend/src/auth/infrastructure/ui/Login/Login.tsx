import { Link } from 'react-router-dom';
import { useLogin } from './Login.hook';
import type { LoginUseCase } from '../../../application/LoginUseCase';
import { Routes } from '../../../../shared/infrastructure/ui/routes';
import styles from './Login.module.css';

interface Props {
  useCase: LoginUseCase;
  onOTPSent: (email: string) => void;
}

export function Login(props: Props) {
  const hook = useLogin(props.useCase);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await hook.requestOTP();
    if (success) {
      props.onOTPSent(hook.email);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={hook.email}
          onChange={(e) => hook.setEmail(e.target.value)}
          className={styles.input}
          disabled={hook.loading}
          required
        />
        <button type="submit" className={styles.button} disabled={hook.loading}>
          {hook.loading ? 'Sending...' : 'Send OTP'}
        </button>
        {hook.error.isSome() && <p className={styles.error}>{hook.error.getOrThrow().message}</p>}
        {hook.otpSent && <p className={styles.success}>OTP sent! Check your email.</p>}
      </form>
      <Link to={Routes.Home} className={styles.link}>
        Back to Home
      </Link>
    </div>
  );
}
