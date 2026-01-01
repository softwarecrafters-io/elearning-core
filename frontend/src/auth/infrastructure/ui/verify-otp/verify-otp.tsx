import { Link } from 'react-router-dom';
import { useVerifyOTP } from './verify-otp.hook';
import type { VerifyOTPUseCase } from '../../../application/VerifyOTPUseCase';
import { Routes } from '../../../../shared/infrastructure/ui/routes';
import styles from './verify-otp.module.css';

interface Props {
  useCase: VerifyOTPUseCase;
  email: string;
  onSuccess: () => void;
}

export function VerifyOTP(props: Props) {
  const hook = useVerifyOTP(props.useCase, props.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await hook.verify();
    if (success) {
      props.onSuccess();
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Verify OTP</h1>
      <p className={styles.subtitle}>Enter the code sent to {props.email}</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="000000"
          value={hook.code}
          onChange={(e) => hook.setCode(e.target.value)}
          className={styles.input}
          disabled={hook.loading}
          maxLength={6}
          required
        />
        <button type="submit" className={styles.button} disabled={hook.loading}>
          {hook.loading ? 'Verifying...' : 'Verify'}
        </button>
        {hook.error.isSome() && <p className={styles.error}>{hook.error.getOrThrow().message}</p>}
      </form>
      <Link to={Routes.Login} className={styles.link}>
        Back to Login
      </Link>
    </div>
  );
}
