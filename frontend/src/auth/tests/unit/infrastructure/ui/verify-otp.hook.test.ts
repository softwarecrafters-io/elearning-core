import { renderHook, act } from '@testing-library/react';
import { useVerifyOTP } from '../../../../infrastructure/ui/verify-otp/verify-otp.hook';
import { VerifyOTPUseCase } from '../../../../application/VerifyOTPUseCase';
import type { AuthGateway } from '../../../../application/ports/AuthGateway';

function createUseCase(gateway?: Partial<AuthGateway>) {
  const authGateway: AuthGateway = {
    requestOTP: jest.fn().mockResolvedValue(undefined),
    verifyOTP: jest.fn().mockResolvedValue(undefined),
    ...gateway,
  };
  return new VerifyOTPUseCase(authGateway);
}

describe('The useVerifyOTP hook', () => {
  it('starts with empty code and no loading', () => {
    const useCase = createUseCase();

    const { result } = renderHook(() => useVerifyOTP(useCase, 'test@example.com'));

    expect(result.current.code).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error.isNone()).toBe(true);
    expect(result.current.success).toBe(false);
  });

  it('updates code when setCode is called', () => {
    const useCase = createUseCase();

    const { result } = renderHook(() => useVerifyOTP(useCase, 'test@example.com'));

    act(() => {
      result.current.setCode('123456');
    });

    expect(result.current.code).toBe('123456');
  });

  it('returns true and sets success when verify succeeds', async () => {
    const useCase = createUseCase();

    const { result } = renderHook(() => useVerifyOTP(useCase, 'test@example.com'));

    act(() => {
      result.current.setCode('123456');
    });

    let success: boolean = false;
    await act(async () => {
      success = await result.current.verify();
    });

    expect(success).toBe(true);
    expect(result.current.success).toBe(true);
    expect(result.current.error.isNone()).toBe(true);
  });

  it('returns false and sets error when verify fails', async () => {
    const useCase = createUseCase({
      verifyOTP: jest.fn().mockRejectedValue(new Error('Invalid OTP')),
    });

    const { result } = renderHook(() => useVerifyOTP(useCase, 'test@example.com'));

    act(() => {
      result.current.setCode('wrong');
    });

    let success: boolean = true;
    await act(async () => {
      success = await result.current.verify();
    });

    expect(success).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error.isSome()).toBe(true);
    expect(result.current.error.getOrThrow().message).toBe('Invalid OTP');
  });

  it('sets loading to true while verifying', async () => {
    let resolvePromise: () => void;
    const useCase = createUseCase({
      verifyOTP: jest.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolvePromise = resolve;
          })
      ),
    });

    const { result } = renderHook(() => useVerifyOTP(useCase, 'test@example.com'));

    act(() => {
      result.current.setCode('123456');
    });

    let verifyPromise: Promise<boolean>;
    act(() => {
      verifyPromise = result.current.verify();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!();
      await verifyPromise;
    });

    expect(result.current.loading).toBe(false);
  });
});
