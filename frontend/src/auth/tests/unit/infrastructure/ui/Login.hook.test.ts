import { renderHook, act } from '@testing-library/react';
import { useLogin } from '../../../../infrastructure/ui/Login/Login.hook';
import { LoginUseCase } from '../../../../application/LoginUseCase';
import type { AuthGateway } from '../../../../application/ports/AuthGateway';

function createUseCase(gateway?: Partial<AuthGateway>) {
  const authGateway: AuthGateway = {
    requestOTP: jest.fn().mockResolvedValue(undefined),
    verifyOTP: jest.fn().mockResolvedValue(undefined),
    ...gateway,
  };
  return new LoginUseCase(authGateway);
}

describe('The Login Form', () => {
  it('initializes ready to receive user email', () => {
    const useCase = createUseCase();

    const { result } = renderHook(() => useLogin(useCase));

    expect(result.current.email).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error.isNone()).toBe(true);
    expect(result.current.otpSent).toBe(false);
  });

  it('accepts user email input', () => {
    const useCase = createUseCase();
    const { result } = renderHook(() => useLogin(useCase));

    act(() => {
      result.current.setEmail('test@example.com');
    });

    expect(result.current.email).toBe('test@example.com');
  });

  it('confirms OTP was sent successfully for valid email', async () => {
    const useCase = createUseCase();
    const { result } = renderHook(() => useLogin(useCase));
    act(() => {
      result.current.setEmail('test@example.com');
    });

    let success: boolean = false;
    await act(async () => {
      success = await result.current.requestOTP();
    });

    expect(success).toBe(true);
    expect(result.current.otpSent).toBe(true);
    expect(result.current.error.isNone()).toBe(true);
  });

  it('rejects OTP request when user is not registered', async () => {
    const useCase = createUseCase({
      requestOTP: jest.fn().mockRejectedValue(new Error('User not found')),
    });
    const { result } = renderHook(() => useLogin(useCase));
    act(() => {
      result.current.setEmail('noexiste@example.com');
    });

    let success: boolean = true;
    await act(async () => {
      success = await result.current.requestOTP();
    });

    expect(success).toBe(false);
    expect(result.current.otpSent).toBe(false);
    expect(result.current.error.isSome()).toBe(true);
    expect(result.current.error.getOrThrow().message).toBe('User not found');
  });

  it('indicates loading while sending OTP', async () => {
    let resolvePromise: () => void;
    const useCase = createUseCase({
      requestOTP: jest.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolvePromise = resolve;
          })
      ),
    });
    const { result } = renderHook(() => useLogin(useCase));
    act(() => {
      result.current.setEmail('test@example.com');
    });

    let requestPromise: Promise<boolean>;
    act(() => {
      requestPromise = result.current.requestOTP();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!();
      await requestPromise;
    });

    expect(result.current.loading).toBe(false);
  });
});
