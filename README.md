# MiniJira-FE

Interfaz web de MiniJira. Presenta un tablero Kanban con tres columnas (Por hacer / En progreso / Hecho) y maneja el ciclo completo de autenticacion: registro, login y logout. Consume la API de MiniJira-BE via Axios.

---

## Stack

| Tecnologia         | Version  | Rol                                      |
|--------------------|----------|------------------------------------------|
| React              | 18.3.1   | Framework de UI                          |
| TypeScript         | 5.4.5    | Tipado estatico                          |
| Vite               | 5.3.1    | Bundler y servidor de desarrollo         |
| Axios              | 1.7.2    | Cliente HTTP con interceptor JWT         |
| Vitest             | 1.6.1    | Framework de tests (instalado en deps)   |
| Testing Library    | (node_modules) | Renderizado y queries de componentes |

---

## Configuracion del backend

La URL base de la API esta definida como constante en `src/api.ts`:

```ts
const BASE_URL = 'http://localhost:8080/api';
```

Para apuntar a otro entorno (staging, produccion) edita esa constante directamente, o extrae el valor a una variable de entorno Vite:

```ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
```

y define `VITE_API_URL` en un archivo `.env.local` en la raiz del proyecto.

---

## Como levantar localmente

**Prerequisitos:** Node.js 18+ y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Modo desarrollo (hot-reload)
npm run dev
```

La app queda disponible en `http://localhost:3000` (configurado en `vite.config.ts`).

```bash
# 3. Build de produccion (valida tipos TypeScript antes de compilar)
npm run build

# 4. Previsualizar el build localmente
npm run preview
```

> El backend debe estar corriendo en `http://localhost:8080` antes de levantar el frontend, de lo contrario el tablero mostrara un error de conexion.

---

## Flujo de autenticacion

1. **Sin sesion activa**, la app muestra el formulario de Login. Desde ahi se puede ir a Registro.
2. **Login / Registro**: el frontend llama a `POST /api/auth/login` o `POST /api/auth/register`. El backend responde con un objeto `AuthResponse` que contiene el token JWT, el username y el email.
3. **Persistencia de sesion**: los tres campos se guardan en `localStorage` con las claves `auth_token`, `auth_username` y `auth_email`. Al recargar la pagina, la app lee esas claves y restaura la sesion sin volver a pedir credenciales.
4. **Adjuntar el token**: `src/api.ts` registra un interceptor de Axios que inyecta automaticamente el header `Authorization: Bearer <token>` en cada request saliente, si el token existe en localStorage.
5. **Logout**: borra las tres claves de localStorage y vuelve a la pantalla de login.

```
Login/Register
     |
     v
POST /api/auth/login  →  { token, username, email }
     |
     v
localStorage.setItem('auth_token', token)
     |
     v
Cada request Axios  →  Authorization: Bearer <token>
```

---

## Como correr los tests

> **Nota**: Vitest y Testing Library estan instalados en `node_modules` pero no estan declarados en `package.json` ni hay un script `test` definido. Ejecuta los tests con el binario local:

```bash
./node_modules/.bin/vitest run
```

O en modo watch durante desarrollo:

```bash
./node_modules/.bin/vitest
```

Los tests corren en entorno `jsdom` (sin browser real) y cubren dos areas:

- **`src/test/BoardColumn.test.tsx`** — componente `BoardColumn`: renderizado de titulo, badge de conteo, mensaje de estado vacio, propagacion de callbacks `onDelete` y `onStatusChange`.
- **`src/test/api.test.ts`** — capa HTTP (`api.ts`): verifica que cada funcion hace el verbo y la ruta correctos (`GET /tasks`, `PATCH /tasks/{id}/status`, `POST /tasks`, `DELETE /tasks/{id}`, `GET /users`) y que los errores de red se propagan correctamente.

---

## Estructura del proyecto

```
src/
├── api.ts                  # Cliente Axios + todas las llamadas al backend
├── types.ts                # Tipos TypeScript compartidos (Task, User, AuthResponse, etc.)
├── App.tsx                 # Componente raiz: maneja sesion, tareas y estado del tablero
├── components/
│   ├── BoardColumn.tsx     # Columna Kanban con lista de TaskCards
│   ├── TaskCard.tsx        # Tarjeta individual de tarea con acciones
│   ├── CreateTaskForm.tsx  # Modal/formulario para crear una tarea nueva
│   ├── LoginForm.tsx       # Formulario de login
│   └── RegisterForm.tsx    # Formulario de registro
└── test/
    ├── BoardColumn.test.tsx
    └── api.test.ts

vite.config.ts              # Configura Vite + puerto de dev server (3000)
package.json                # Dependencias y scripts (dev, build, preview)
tsconfig.json               # Configuracion TypeScript
```
