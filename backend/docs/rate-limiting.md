# Rate Limiting

## Brute Force Protection

The system temporarily blocks verification attempts after 5 failed OTP attempts.

```mermaid
sequenceDiagram
    participant U as User
    participant API as API REST
    participant UC as VerifyOTPUseCase
    participant D as LoginAttempt
    
    U->>API: POST /auth/verify {email, code}
    API->>UC: execute(email, code)
    UC->>D: Find LoginAttempt
    
    alt Is blocked (5+ failures, <30min)
        UC-->>API: Error: Too many attempts
        API-->>U: 400 "Try again in 30 minutes"
    else Not blocked
        UC->>D: verifyCode(code)
        alt Code correct
            UC->>D: Delete LoginAttempt
            UC-->>API: Generate JWT
            API-->>U: 200 {token}
        else Code incorrect
            UC->>D: registerFailedAttempt()
            UC-->>API: Error: Invalid code
            API-->>U: 400 "Invalid or expired OTP"
        end
    end
```

## Domain Logic

```mermaid
flowchart TD
    A[verifyCode called] --> B{isBlocked?}
    B -->|Yes| C[Throw: Too many attempts]
    B -->|No| D{Code correct?}
    D -->|Yes| E[Return token, delete attempt]
    D -->|No| F[registerFailedAttempt]
    F --> G[Increment failedAttempts]
    G --> H[Update lastFailedAt]
    H --> I[Throw: Invalid code]
```

## Configuration

| Parameter | Value |
|-----------|-------|
| Max attempts | 5 |
| Block duration | 30 minutes |
| Auto reset | After 30 min without attempts |

## Behavior

1. **Fresh login attempt**: User starts with 0 failed attempts
2. **Wrong OTP**: Failed attempts counter increments, timestamp recorded
3. **5 failed attempts**: User is blocked for 30 minutes
4. **After 30 minutes**: Counter resets, user can try again
5. **Correct OTP**: Login attempt deleted, token issued

## LoginAttempt Entity

```mermaid
classDiagram
    class LoginAttempt {
        -Id id
        -Email email
        -OTPCode otpCode
        -number failedAttempts
        -Maybe~Date~ lastFailedAt
        +create(email) LoginAttempt
        +isExpired() boolean
        +verifyCode(code) boolean
        +isBlocked() boolean
        +registerFailedAttempt() void
    }
```
