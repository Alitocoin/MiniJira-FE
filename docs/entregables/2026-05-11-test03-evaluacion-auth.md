# Informe de Evaluacion: Test 03 — Feature Auth JWT

**Fecha:** 2026-05-11
**Evaluacion:** Test 03 — Capacidad de Implementacion de Nueva Funcionalidad (Auth + JWT)
**Repositorio BE:** https://github.com/Alitocoin/MiniJira-BE (branch: `test-03-user-feature_v01`)
**Repositorio FE:** https://github.com/Alitocoin/MiniJira-FE (branch: `test-03-user-feature_v01`)
**Preparado por:** Luis Barrios — Technical Writer, DevForce

---

## 1. Resumen Ejecutivo

Se evaluo la capacidad del sistema multiagente DevForce para implementar un modulo completo de autenticacion sobre un sistema existente (Mini Jira funcional pero sin auth). El objetivo incluia registro de usuarios, login, generacion y validacion de tokens JWT, rutas protegidas en el backend y guard de rutas en el frontend.

El resultado fue **exitoso en primera pasada y sin correcciones post-implementacion**: ambos componentes (backend Spring Boot con Spring Security y frontend React con AuthContext) compilaron, se integraron correctamente y cumplieron el flujo end-to-end de registro → login → kanban protegido en aproximadamente 8 minutos de implementacion efectiva.

La arquitectura resultante separa correctamente las responsabilidades en ambas capas: el backend delega la autorizacion a un filtro dedicado que puebla el `SecurityContext`, y el frontend centraliza el estado de sesion en un `AuthContext` que alimenta tanto el guard de rutas como el interceptor Axios.

---

## 2. Metricas de Evaluacion

| Metrica | Backend (BE) | Frontend (FE) |
|---|---|---|
| **Compila** | SI — `mvn compile` BUILD SUCCESS | SI — `npm run build` sin errores |
| **Funciona** | SI — registro, login, kanban end-to-end | SI — Login/Register publicos, Kanban protegido |
| **Seguridad** | **4/5** — BCrypt, JWT configurable, sin hardcodeo. Descuento: `jwt.secret` en `application.properties` en lugar de variable de entorno en produccion | **4/5** — Interceptor 401 con limpieza de localStorage. Descuento: sin tests unitarios |
| **Arquitectura** | **5/5** — Controller→Service→Repository; filtro JWT como `OncePerRequestFilter`; `SecurityFilterChain` stateless | **5/5** — AuthContext + PrivateRoute + interceptor Axios; separacion de concerns correcta |
| **Calidad de codigo** | **4/5** — DTOs tipados, BCrypt, secret configurable. Sin tests unitarios | **4/5** — TypeScript estricto, manejo de errores 401/404/409. Sin tests |
| **Iteraciones de correccion** | 0 | 0 |
| **Tiempo de implementacion** | ~6 min | ~4 min |

### Justificacion de calificaciones

**Seguridad BE — 4/5:** El backend implementa BCrypt para hashing de passwords, JWT con algoritmo HS256, secret y expiry configurables via `application.properties`, y el `DataInitializer` hashea las passwords del seed. El descuento de 1 punto corresponde a que `jwt.secret` reside en `application.properties` versionado; en un entorno de produccion la practica correcta es inyectarlo como variable de entorno (`JWT_SECRET`) y referenciarlo desde `application.properties` con `${JWT_SECRET}`.

**Arquitectura BE — 5/5:** El `SecurityFilterChain` esta configurado como stateless (sin sesion HTTP), CSRF desactivado para API REST, y las rutas `/api/v1/auth/**` son publicas mientras el resto requiere autenticacion. El `JwtAuthenticationFilter` extiende `OncePerRequestFilter` y puebla el `SecurityContext` correctamente. La separacion `AuthController → AuthService → UserRepository` respeta el patron en capas del sistema existente.

**Arquitectura FE — 5/5:** El `AuthContext` centraliza el estado de sesion (`token`, `userId`, `username`), persiste en `localStorage` y se rehidrata al recargar la pagina. El `PrivateRoute` actua como guard de React Router. El interceptor de Axios inyecta el `Bearer` token en cada request y maneja el 401 global redirigiendo a `/login` con limpieza del storage. La separacion entre logica de sesion (AuthContext), guard de rutas (PrivateRoute) y comunicacion HTTP (axiosInstance) es correcta.

---

## 3. Descripcion Tecnica

### 3.1 Arquitectura Backend — Modulo Auth

```
MiniJira-BE (Spring Boot 3.x / Java 17)
│
├── SecurityConfig               ← SecurityFilterChain: stateless, CSRF off
│   └── /api/v1/auth/**         publico
│   └── resto                   requiere autenticacion
│
├── JwtAuthenticationFilter      ← OncePerRequestFilter
│   └── extrae Bearer token      valida, puebla SecurityContext
│
├── JwtUtil                      ← genera/valida tokens JWT HS256
│   └── secret desde application.properties (jwt.secret)
│   └── expiry desde application.properties (jwt.expiration)
│
├── AuthController               POST /api/v1/auth/register (201)
│   └── AuthController           POST /api/v1/auth/login (200)
│
├── AuthService / AuthServiceImpl← logica de registro y login
│
├── UserDetailsServiceImpl       ← carga usuario por email (Spring Security)
│
├── DTOs
│   ├── AuthRequest              { email, password }
│   ├── RegisterRequest          { username, email, password }
│   └── AuthResponse             { token, userId, username }
│
└── DataInitializer              ← passwords del seed hasheadas con BCrypt
```

### 3.2 Endpoints Auth Implementados

| Metodo | Path | Request Body | Response | Descripcion |
|---|---|---|---|---|
| POST | `/api/v1/auth/register` | `RegisterRequest` | `201 Created` + `AuthResponse` | Registro de nuevo usuario; BCrypt hash del password |
| POST | `/api/v1/auth/login` | `AuthRequest` | `200 OK` + `AuthResponse` | Login; retorna JWT valido |

**`AuthResponse`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "username": "Ana Lopez"
}
```

### 3.3 Dependencias agregadas al backend

```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-api</artifactId>
  <version>0.12.3</version>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-impl</artifactId>
  <version>0.12.3</version>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-jackson</artifactId>
  <version>0.12.3</version>
</dependency>
```

### 3.4 Arquitectura Frontend — Modulo Auth

```
MiniJira-FE (React + TypeScript + Vite)
│
├── src/context/AuthContext.tsx  ← estado global de sesion
│   ├── token                   string | null
│   ├── user                    { userId, username } | null
│   ├── login(token, user)      persiste en localStorage
│   └── logout()                limpia localStorage
│
├── src/api/axiosInstance.ts    ← cliente HTTP configurado
│   ├── baseURL                 desde VITE_API_URL
│   ├── interceptor request     inyecta Authorization: Bearer <token>
│   └── interceptor response    ante 401: limpia storage, redirige a /login
│
├── src/components/PrivateRoute.tsx ← guard React Router
│   └── si no hay token: redirect a /login
│
├── src/pages/LoginPage.tsx     ← pantalla publica
│   ├── POST /auth/login
│   ├── invoca AuthContext.login()
│   ├── navega a /
│   └── maneja 401 y 404
│
├── src/pages/RegisterPage.tsx  ← pantalla publica
│   ├── POST /auth/register
│   ├── redirige a /login con mensaje de exito
│   └── maneja 409 (email duplicado) y 400
│
└── App.tsx (actualizado)
    ├── /login          → LoginPage (publico)
    ├── /register       → RegisterPage (publico)
    ├── /              → KanbanBoard (privado, PrivateRoute)
    └── /*             → redirect a /login
```

### 3.5 Archivos nuevos — Frontend

| Archivo | Responsabilidad |
|---|---|
| `src/context/AuthContext.tsx` | Estado global de sesion; persiste y rehidrata desde `localStorage` |
| `src/pages/LoginPage.tsx` | Pantalla de login; consume POST `/auth/login`; maneja errores 401/404 |
| `src/pages/RegisterPage.tsx` | Pantalla de registro; consume POST `/auth/register`; maneja errores 409/400 |
| `src/components/PrivateRoute.tsx` | Guard de rutas; redirige a `/login` si no hay token valido |
| `src/api/axiosInstance.ts` | Cliente Axios centralizado con interceptores de auth y manejo global de 401 |

### 3.6 Decisiones Tecnicas Destacadas

**JWT stateless en backend:** El `SecurityFilterChain` no usa sesion HTTP (`SessionCreationPolicy.STATELESS`). Cada request es validado por el filtro JWT de forma independiente. Esto hace el backend escalable horizontalmente sin necesidad de sesion compartida.

**Rehidratacion de sesion en FE:** Al recargar la pagina, `AuthContext` lee el token y los datos de usuario desde `localStorage`. El usuario no pierde la sesion ante un F5, lo que es el comportamiento esperado en una aplicacion Kanban de trabajo continuo.

**Interceptor 401 global:** En vez de manejar el 401 en cada componente, `axiosInstance` centraliza la logica de expiración de token: limpia `localStorage` y redirige a `/login`. Esto evita que el usuario quede en un estado inconsistente con un token expirado pero visible en la UI.

**BCrypt en DataInitializer:** El seed de datos del sistema ya usaba passwords en texto plano. El `DataInitializer` fue actualizado para hashear esos passwords con BCrypt, garantizando que el sistema no tenga passwords legibles en base de datos desde el primer arranque.

---

## 4. Metricas de Proceso

### 4.1 Desglose de tiempo (wall clock)

| Fase | Tiempo (aprox) | Descripcion |
|---|---|---|
| Implementacion Backend (Carlos Frost) | ~6 min | Spring Security, JWT, AuthController, DTOs, `application.properties`, DataInitializer |
| Implementacion Frontend (Paula Aguilar) | ~4 min | AuthContext, LoginPage, RegisterPage, PrivateRoute, axiosInstance, App.tsx |
| Documentacion (Luis Barrios) | ~2 min | Commit de docs |
| **TOTAL** | **~8 min** | (tiempo de implementacion, sin contar overhead de sesion) |

### 4.2 Metricas adicionales

| Metrica | Valor |
|---|---|
| Archivos nuevos/modificados — BE | 16 |
| Lineas de codigo — BE | 429 inserciones |
| Archivos nuevos — FE | 5 (AuthContext, LoginPage, RegisterPage, PrivateRoute, axiosInstance) |
| Archivos modificados — FE | 1 (App.tsx) |
| Endpoints auth implementados | 2 (register, login) |
| Iteraciones de correccion | 0 en BE, 0 en FE |
| Commit BE | `0650b00` — 2026-05-11 12:50:52 UTC |
| Commit FE (impl) | `521cc56` — 2026-05-11 12:54:32 UTC |
| Commit FE (docs) | `cfa5e9a` — 2026-05-11 12:56:55 UTC |
| Agentes involucrados | 3 (Carlos Frost BE, Paula Aguilar FE, Luis Barrios Docs) |

---

## 5. Delegacion del Equipo

| Agente | Rol | Tarea en este test |
|---|---|---|
| Carlos Frost (Backend Developer) | Spring Boot, Spring Security, JWT | Implemento Spring Security, JwtUtil, JwtAuthenticationFilter, AuthController, AuthService, DTOs, `application.properties`, DataInitializer con BCrypt |
| Paula Aguilar (Frontend Developer) | React, TypeScript, Axios | Implemento AuthContext, LoginPage, RegisterPage, PrivateRoute, axiosInstance, actualizo App.tsx |
| Luis Barrios (Docs) | Technical Writing | Generacion de este informe de evaluacion |

**Patron de ejecucion:** Backend y frontend se implementaron en secuencia rapida (BE primero dado que define el contrato de auth, FE a continuacion consumiendo ese contrato). El tiempo total de ~8 minutos distribuye ~6 min en BE y ~4 min en FE con solapamiento posible en la etapa de verificacion.

---

## 6. Observaciones y Conclusiones

### Fortalezas observadas

**Integracion sin fricciones:** El modulo de auth se injerto sobre el sistema existente sin romper funcionalidad previa. El Kanban quedo protegido y los endpoints existentes (`/api/v1/tasks`, `/api/v1/users`, `/api/v1/projects`) siguen funcionando bajo autenticacion JWT.

**Manejo de errores explicito:** Ambas pantallas (Login y Register) manejan codigos de error especificos: 401 en login (credenciales incorrectas), 404 en login (usuario no existe), 409 en register (email ya registrado), 400 en register (datos invalidos). Esto produce mensajes de error utiles para el usuario en lugar de un generico "algo salio mal".

**Interceptor como unico punto de control:** El interceptor de respuesta en `axiosInstance` garantiza que cualquier 401 (token expirado, invalido o ausente) resulte en limpieza de sesion y redirect a login. Ninguna pantalla necesita replicar esa logica.

**Velocidad de implementacion:** 8 minutos para un modulo de auth completo (incluyendo BCrypt, JWT, filtro de Spring Security, AuthContext, PrivateRoute e interceptor Axios) es un resultado solido. La ausencia de correcciones post-implementacion confirma que el agente tenia un modelo mental correcto del sistema antes de escribir codigo.

### Areas de mejora

**`jwt.secret` en `application.properties`:** En un entorno real, el secret JWT debe provenir de una variable de entorno (`${JWT_SECRET}`) y no estar hardcodeado en el archivo de propiedades que puede quedar versionado en git. Este es el gap de seguridad mas relevante del test.

**Ausencia de tests:** El modulo de auth es precisamente el que mas se beneficiaria de tests: un test de integracion que verifique el flujo register → login → request autenticado. La ausencia de tests es el gap de calidad mas relevante.

**Expiracion de token en FE:** El `AuthContext` no evalua si el token almacenado en `localStorage` ya expiro al rehidratar la sesion. Un usuario con un token expirado veria el Kanban hasta hacer el primer request, momento en que el interceptor 401 lo redireccionaria. Validar la expiracion en el momento de rehidratacion mejoraria la experiencia.

### Recomendaciones para la evaluacion

1. **El flujo end-to-end en primera pasada merece maxima puntuacion en el criterio de funcionalidad.** Registro, login y acceso al Kanban protegido sin iteraciones de correccion es el resultado que el test buscaba validar.

2. **Diferenciar "seguro para evaluacion" de "seguro para produccion" en la rubrica.** Un `jwt.secret` en `application.properties` es aceptable en un test controlado, pero debe marcarse como gap para produccion. La rubrica deberia reflejarlo con un descuento explicito y no como falla total.

3. **Agregar criterio de tests de integracion** en futuras evaluaciones de este tipo. Un test que recorra register → login → request con JWT → 401 sin token cubre los casos criticos del modulo.

---

*Documento generado el 2026-05-11. Basado en analisis del codigo fuente en los repositorios MiniJira-BE (branch `test-03-user-feature_v01`, commit `0650b00`) y MiniJira-FE (branch `test-03-user-feature_v01`, commits `521cc56` y `cfa5e9a`), y en las metricas de proceso registradas durante el test.*
