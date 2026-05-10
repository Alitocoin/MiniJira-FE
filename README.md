# Mini Jira - Frontend

Tablero Kanban para gestión de tareas, construido con React 18 + Vite. Consume una API REST de backend para operaciones CRUD sobre tareas, usuarios y proyectos.

## Stack

- React 18
- Vite 5
- CSS Modules (sin dependencias de UI externas)
- Axios (llamadas HTTP)

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar:

```bash
cp .env.example .env
```

| Variable       | Descripcion                  | Default                    |
|----------------|------------------------------|----------------------------|
| VITE_API_URL   | URL base del backend         | http://localhost:8080      |

## Correr en local

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Backend esperado

El backend debe correr en `http://localhost:8080` (o el valor configurado en `VITE_API_URL`) y exponer:

| Metodo | Endpoint                      | Descripcion              |
|--------|-------------------------------|--------------------------|
| GET    | /api/tasks                    | Listar todas las tareas  |
| POST   | /api/tasks                    | Crear tarea              |
| PATCH  | /api/tasks/{id}/status        | Cambiar status           |
| DELETE | /api/tasks/{id}               | Eliminar tarea           |
| GET    | /api/users                    | Listar usuarios          |
| GET    | /api/projects                 | Listar proyectos         |

## Funcionalidades

- Tablero Kanban con columnas: **To Do**, **En progreso**, **Hecho**
- Contador de tareas por columna
- Mover tareas entre columnas con un click
- Crear tareas via modal con formulario completo
- Eliminar tareas con confirmacion
- Actualizaciones optimistas (la UI responde antes de que el backend confirme)
- Manejo de errores con opcion de reintentar

## Build para produccion

```bash
npm run build
```

Los archivos se generan en `dist/`.
