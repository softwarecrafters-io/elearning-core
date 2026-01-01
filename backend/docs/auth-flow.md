# Authentication Flow

## Registration and OTP-based Login

```mermaid
sequenceDiagram
    participant U as User
    participant API as API REST
    participant UC as UseCases
    participant D as Domain
    participant ES as EmailSender
    
    Note over U,ES: 1. REGISTRATION
    U->>API: POST /auth/register {email, name}
    API->>UC: RegisterUserUseCase
    UC->>D: Create User
    API-->>U: 201 Created
    
    Note over U,ES: 2. LOGIN (request OTP)
    U->>API: POST /auth/login {email}
    API->>UC: RequestLoginUseCase
    UC->>D: Verify User exists
    UC->>D: Create LoginAttempt
    UC->>ES: Send email with code
    API-->>U: 200 OK
    
    Note over U,ES: 3. VERIFY OTP
    U->>API: POST /auth/verify {email, code}
    API->>UC: VerifyOTPUseCase
    UC->>D: Validate LoginAttempt
    UC->>D: Generate JWT
    API-->>U: 200 {token}
```

## Protected Endpoints

```mermaid
sequenceDiagram
    participant U as User
    participant API as API REST
    participant MW as AuthMiddleware
    participant UC as UseCases
    participant D as Domain
    
    Note over U,D: GET PROFILE
    U->>API: GET /profile/me [Bearer token]
    API->>MW: Verify JWT
    MW->>UC: GetCurrentUserUseCase
    UC->>D: Find User by ID
    API-->>U: 200 {id, email, name}
    
    Note over U,D: UPDATE NAME
    U->>API: PATCH /profile/me {name} [Bearer token]
    API->>MW: Verify JWT
    MW->>UC: UpdateUserNameUseCase
    UC->>D: Update User name
    API-->>U: 200 {id, email, name}
```

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user with email and name |
| POST | `/auth/login` | No | Request OTP code sent to email |
| POST | `/auth/verify` | No | Verify OTP code and receive JWT token |
| GET | `/profile/me` | JWT | Get current user profile |
| PATCH | `/profile/me` | JWT | Update user name |

## OTP Code

- 6-digit numeric code
- Valid for 5 minutes after generation
- Single use (deleted after successful verification)

## Project Structure

```
src/auth/
├── domain/
│   ├── entities/
│   │   ├── User.ts          # email + name
│   │   └── LoginAttempt.ts  # email + otpCode + rate limiting
│   ├── value-objects/
│   │   ├── Email.ts
│   │   ├── OTPCode.ts
│   │   └── Token.ts
│   └── repositories/
│       ├── UserRepository.ts
│       └── LoginAttemptRepository.ts
├── application/
│   ├── RegisterUserUseCase.ts
│   ├── RequestLoginUseCase.ts
│   ├── VerifyOTPUseCase.ts
│   ├── GetCurrentUserUseCase.ts
│   ├── UpdateUserNameUseCase.ts
│   └── ports/
│       ├── EmailSender.ts
│       └── TokenGenerator.ts
├── infrastructure/
│   ├── adapters/
│   │   ├── MongoUserRepository.ts
│   │   ├── MongoLoginAttemptRepository.ts
│   │   ├── ConsoleEmailSender.ts
│   │   └── JWTTokenGenerator.ts
│   └── http/
│       ├── AuthController.ts
│       ├── ProfileController.ts
│       └── AuthMiddleware.ts
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```
