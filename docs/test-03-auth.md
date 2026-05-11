# Test 03 — Autenticación JWT y Gestión de Usuarios

## 1. Resumen del feature

Este test implementa el módulo completo de autenticación sobre el sistema Mini Jira.
El backend expone endpoints de registro y login que generan tokens JWT firmados con BCrypt
para hashing de contraseñas. El frontend agrega pantallas públicas (`/register`, `/login`),
un guard de rutas privadas (`PrivateRoute`) y un interceptor Axios que inyecta el token
automáticamente en cada request autenticada.

---

## 2. Endpoints de autenticación

### POST /api/v1/auth/register

Crea una cuenta nueva. La contraseña se almacena hasheada con BCrypt.

**Request body**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Responses**

| Código | Descripción |
|--------|-------------|
| 201 | Usuario creado. Body: `{ id: number, username: string, email: string }` |
| 400 | Validación fallida (campo vacío, formato inválido, etc.) |
| 409 | El email ya está registrado |

---

### POST /api/v1/auth/login

Autentica un usuario existente y devuelve un JWT.

**Request body**
```json
{
  "email": "string",
  "password": "string"
}
```

**Responses**

| Código | Descripción |
|--------|-------------|
| 200 | Login exitoso. Body: `{ token: string, type: "Bearer", userId: number, username: string }` |
| 401 | Credenciales inválidas (contraseña incorrecta) |
| 404 | No existe cuenta con ese email |

---

### Endpoints protegidos

Todos requieren header `Authorization: Bearer <token>`. Sin token o con token inválido
el backend responde `401 Unauthorized`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/tasks` | Lista todas las tareas |
| `POST` | `/api/v1/tasks` | Crea una tarea nueva |
| `PATCH` | `/api/v1/tasks/{id}/status` | Cambia el estado de una tarea |
| `PUT` | `/api/v1/tasks/{id}` | Actualiza una tarea completa |
| `DELETE` | `/api/v1/tasks/{id}` | Elimina una tarea |
| `GET` | `/api/v1/users` | Lista usuarios (para asignar tareas) |
| `GET` | `/api/v1/projects` | Lista proyectos (para filtrar tareas) |

---

## 3. Flujo JWT

1. **Registro** — cliente hace `POST /api/v1/auth/register` con `username`, `email` y `password`. El backend hashea la contraseña con BCrypt y persiste el usuario. Responde 201.
2. **Login** — cliente hace `POST /api/v1/auth/login`. El backend valida las credenciales, genera un JWT firmado con el secret configurado y responde con `{ token, type, userId, username }`.
3. **Persistencia local** — el frontend guarda `token`, `userId` y `username` en `localStorage` vía `AuthContext.login()`.
4. **Requests autenticadas** — el interceptor de `axiosInstance` lee `token` de `localStorage` en cada request saliente e inyecta `Authorization: Bearer <token>` en el header.
5. **Validación en el backend** — `JwtAuthenticationFilter` intercepta cada request, extrae el token del header, valida la firma y la expiración, y setea el `SecurityContext`. Si el token es inválido o ausente sobre una ruta protegida, responde `401`.
6. **Expiración / sesión inválida** — si el backend responde `401`, el interceptor de response en `axiosInstance` limpia `localStorage` y redirige a `/login` automáticamente.

---

## 4. Arquitectura de seguridad — Backend

| Componente | Responsabilidad |
|------------|-----------------|
| `SecurityConfig` | Define el `SecurityFilterChain`: CSRF deshabilitado, sesión stateless, rutas públicas (`/api/v1/auth/**`) vs rutas protegidas (todo lo demás). |
| `JwtUtil` | Genera tokens JWT firmados con el secret (`jwt.secret` en `application.properties`). Valida firma y expiración. |
| `JwtAuthenticationFilter` | `OncePerRequestFilter` que extrae el token del header `Authorization`, llama a `JwtUtil` para validarlo y carga el `UserDetails` en el `SecurityContext`. |
| `UserDetailsServiceImpl` | Implementa `UserDetailsService` de Spring Security. Carga el usuario desde la base de datos por email para que Spring pueda verificar credenciales. |

> **Nota de seguridad:** `jwt.secret` está definido en `application.properties`. En producción debe moverse a una variable de entorno o un gestor de secretos (ej. Secret Manager, Vault). Ver checklist sección 7.

---

## 5. Arquitectura de auth — Frontend

| Componente | Archivo | Responsabilidad |
|------------|---------|-----------------|
| `AuthContext` | `src/context/AuthContext.tsx` | Estado global de sesión: expone `token`, `user` (`userId`, `username`), `login()` y `logout()`. Persiste en `localStorage` y rehidrata al recargar la app. |
| `PrivateRoute` | `src/components/PrivateRoute.tsx` | Guard de rutas React Router. Si no hay `token` en contexto, redirige a `/login` con `<Navigate replace>`. |
| `axiosInstance` | `src/api/axiosInstance.ts` | Instancia Axios con `baseURL = VITE_API_URL` (default `http://localhost:8080`). Interceptor de request: inyecta `Authorization: Bearer <token>`. Interceptor de response: ante 401 limpia sesión y redirige a `/login`. |
| `LoginPage` | `src/pages/LoginPage.tsx` | Pantalla pública. Llama a `POST /api/v1/auth/login`, invoca `AuthContext.login()` y navega a `/`. Maneja errores 401 y 404 con mensajes explícitos. |
| `RegisterPage` | `src/pages/RegisterPage.tsx` | Pantalla pública. Llama a `POST /api/v1/auth/register` y redirige a `/login` con mensaje de éxito. Maneja errores 409 y 400. |

**Flujo de rutas en `App.tsx`:**
```
/login       → LoginPage    (pública)
/register    → RegisterPage (pública)
/            → KanbanBoard  (privada, protegida por PrivateRoute)
/*           → Navigate to /login
```

---

## 6. Cómo probarlo

### Prerequisitos
- Backend corriendo en `http://localhost:8080`
- Frontend corriendo en `http://localhost:5173` (`npm run dev`)
- Variable de entorno: copiar `.env.example` como `.env` (el valor default apunta a localhost:8080)

### Pasos

1. Abrir `http://localhost:5173/register`.
2. Completar `username`, `email` y `password` (mínimo 8 caracteres) y hacer clic en **Crear cuenta**.
3. Verificar redirección automática a `/login` con el mensaje "Cuenta creada exitosamente".
4. Ingresar las credenciales recién creadas y hacer clic en **Ingresar**.
5. Verificar redirección al tablero Kanban (`/`). El nombre de usuario debe aparecer en el header.
6. Abrir DevTools (F12) → pestaña **Network** → hacer cualquier acción en el tablero → verificar que las requests a `/api/v1/tasks` incluyen el header `Authorization: Bearer eyJ...`.
7. Probar expiración/logout manual:
   - Ir a DevTools → **Application** → **Local Storage** → borrar las claves `token`, `userId`, `username`.
   - Recargar la página.
   - Verificar redirección automática a `/login`.
8. Probar el botón **Salir** en el header del tablero → debe limpiar sesión y redirigir a `/login`.

---

## 7. Checklist de métricas — test-03

| Métrica | Criterio | Estado |
|---------|----------|--------|
| Compila | `mvn compile` (BE) y `npm run build` (FE) sin errores | ✅ |
| Funciona | Registro, login y kanban funcionan end-to-end | ✅ |
| Seguridad | Hash BCrypt, JWT con secret configurable, sin credenciales hardcodeadas | 4/5 |
| Arquitectura | Capas Controller→Service→Repository; AuthContext; PrivateRoute; interceptor Axios | 5/5 |
| Calidad de código | TypeScript estricto, validaciones, manejo de errores, SOLID | 4/5 |
| Observacion seguridad | `jwt.secret` en `application.properties`: mover a variable de entorno en producción | ⚠️ |
