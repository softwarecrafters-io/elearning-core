---
name: Protected User Endpoints
overview: "Implementar middleware de autenticación JWT y dos endpoints protegidos: GET /auth/me para obtener perfil y PATCH /auth/me para actualizar nombre."
todos:
  - id: get-current-user-usecase
    content: GetCurrentUserUseCase - busca usuario por ID
    status: completed
  - id: update-user-name-usecase
    content: UpdateUserNameUseCase - actualiza nombre del usuario
    status: completed
  - id: auth-middleware
    content: AuthMiddleware - verifica JWT y extrae userId
    status: completed
  - id: protected-endpoints
    content: Endpoints GET/PATCH /auth/me en AuthController
    status: completed
  - id: wire-routes
    content: Registrar rutas protegidas con middleware
    status: completed
---

# Endpoints protegidos con JWT

## Componentes a crear

### 1. Domain

- **`Id` value object** (si no existe): Para identificar usuarios por ID

### 2. Application

- **`GetCurrentUserUseCase`**: Busca usuario por ID en BD, devuelve DTO
- **`UpdateUserNameUseCase`**: Actualiza nombre del usuario en BD

### 3. Infrastructure

- **`AuthMiddleware`**: Verifica JWT, extrae `userId`, lo adjunta a `request`
- **Endpoints en `AuthController`**:
- `GET /auth/me` - Protegido, devuelve perfil
- `PATCH /auth/me` - Protegido, actualiza nombre

## Archivos principales

| Capa | Archivo ||------|---------|| Application | [`src/auth/application/GetCurrentUserUseCase.ts`](src/auth/application/GetCurrentUserUseCase.ts) || Application | [`src/auth/application/UpdateUserNameUseCase.ts`](src/auth/application/UpdateUserNameUseCase.ts) || Infrastructure | [`src/auth/infrastructure/http/AuthMiddleware.ts`](src/auth/infrastructure/http/AuthMiddleware.ts) || Infrastructure | [`src/auth/infrastructure/http/AuthController.ts`](src/auth/infrastructure/http/AuthController.ts) (modificar) || Routes | [`src/shared/infrastructure/routes.ts`](src/shared/infrastructure/routes.ts) (agregar rutas protegidas) |

## Desarrollo Inside-Out (TDD)

1. **GetCurrentUserUseCase** - Unit test con InMemoryUserRepository
2. **UpdateUserNameUseCase** - Unit test con InMemoryUserRepository
3. **AuthMiddleware** - Unit test (verificación JWT)
4. **AuthController** - E2E tests para GET/PATCH /auth/me

## API

```javascript
GET /auth/me
Authorization: Bearer <token>
Response: { "id": "...", "email": "...", "name": "..." }

PATCH /auth/me
Authorization: Bearer <token>
Body: { "name": "Nuevo Nombre" }
Response: { "id": "...", "email": "...", "name": "Nuevo Nombre" }


```