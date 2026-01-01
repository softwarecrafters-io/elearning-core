---
name: Email Login with Registration
overview: Sistema de autenticación passwordless con registro explícito (email + nombre), login con OTP por email, y sesiones JWT. Incluye refactorización de OTPRepository a LoginAttemptRepository.
todos:
  - id: update-user
    content: "Refactorizar User Entity: agregar campo name"
    status: completed
  - id: login-attempt
    content: "TDD: LoginAttempt Entity (crear, verificar código, expiración)"
    status: completed
    dependencies:
      - update-user
  - id: login-attempt-repo
    content: "TDD: LoginAttemptRepository (reemplaza OTPRepository)"
    status: completed
    dependencies:
      - login-attempt
  - id: register-uc
    content: "TDD: RegisterUserUseCase (crea usuario con email+nombre)"
    status: completed
    dependencies:
      - update-user
  - id: request-login-uc
    content: "TDD: RequestLoginUseCase (verifica user, crea LoginAttempt)"
    status: completed
    dependencies:
      - login-attempt-repo
      - register-uc
  - id: verify-otp-uc
    content: "TDD: VerifyOTPUseCase (valida LoginAttempt, genera JWT)"
    status: completed
    dependencies:
      - login-attempt-repo
  - id: jwt-generator
    content: "TDD: JWTTokenGenerator adapter"
    status: completed
    dependencies:
      - verify-otp-uc
  - id: console-email
    content: "TDD: ConsoleEmailSender adapter"
    status: completed
    dependencies:
      - request-login-uc
  - id: mongo-repos
    content: "Integration: MongoUserRepository + MongoLoginAttemptRepository"
    status: completed
    dependencies:
      - login-attempt-repo
  - id: auth-controller
    content: "E2E: AuthController (register, login, verify)"
    status: completed
    dependencies:
      - register-uc
      - request-login-uc
      - verify-otp-uc
  - id: wire-factory
    content: Integrar en factory.ts y routes.ts
    status: completed
    dependencies:
      - auth-controller
---

# Sistema de Login con Registro y OTP

## Flujo de Autenticación Actualizado

```mermaid
sequenceDiagram
    participant U as Usuario
    participant API as API REST
    participant UC as UseCases
    participant D as Domain
    participant ES as EmailSender
    
    Note over U,ES: 1. REGISTRO
    U->>API: POST /auth/register {email, name}
    API->>UC: RegisterUserUseCase
    UC->>D: Crear User
    API-->>U: 201 Created
    
    Note over U,ES: 2. LOGIN (solicitar OTP)
    U->>API: POST /auth/login {email}
    API->>UC: RequestLoginUseCase
    UC->>D: Verificar User existe
    UC->>D: Crear LoginAttempt
    UC->>ES: Enviar email con código
    API-->>U: 200 OK
    
    Note over U,ES: 3. VERIFICAR OTP
    U->>API: POST /auth/verify {email, code}
    API->>UC: VerifyOTPUseCase
    UC->>D: Validar LoginAttempt
    UC->>D: Generar JWT
    API-->>U: 200 {token}
```



## Cambios Principales

### 1. User Entity (actualizar)

- Agregar `name` como campo obligatorio
- Actualizar factory methods y `toPrimitives()`

### 2. LoginAttempt Entity (nueva)

- Reemplaza el concepto de OTPRepository
- Contiene: id, email, otpCode
- Comportamiento: `isExpired()`, `verifyCode()`

### 3. Repositories

- **UserRepository**: sin cambios en interface
- **LoginAttemptRepository**: reemplaza OTPRepository
- `save(attempt)`, `findByEmail()`, `deleteByEmail()`

### 4. UseCases

- **RegisterUserUseCase** (nuevo): Crea usuario con email + nombre
- **RequestLoginUseCase**: Verifica que usuario exista, crea LoginAttempt
- **VerifyOTPUseCase**: Valida LoginAttempt y genera JWT

### 5. HTTP Endpoints

- `POST /auth/register` - Registro con email y nombre
- `POST /auth/login` - Solicita código OTP
- `POST /auth/verify` - Verifica código y retorna JWT

---

## Estructura Final

```javascript
src/auth/
├── domain/
│   ├── entities/
│   │   ├── User.ts          # email + name
│   │   └── LoginAttempt.ts  # email + otpCode
│   ├── value-objects/
│   │   ├── Email.ts         # ✅ completado
│   │   ├── OTPCode.ts       # ✅ completado
│   │   └── Token.ts         # ✅ completado
│   └── repositories/
│       ├── UserRepository.ts         # ✅ completado
│       └── LoginAttemptRepository.ts # reemplaza OTPRepository
├── application/
│   ├── RegisterUserUseCase.ts  # nuevo
│   ├── RequestLoginUseCase.ts
│   ├── VerifyOTPUseCase.ts
│   └── ports/
│       ├── EmailSender.ts      # ✅ completado
│       └── TokenGenerator.ts   # ✅ completado
├── infrastructure/
│   ├── adapters/
│   └── http/AuthController.ts
└── tests/


```