# Informe de Evaluacion: Test 02 — Bug Fixing

**Fecha:** 2026-05-11
**Evaluacion:** Test 02 — Capacidad de Deteccion y Correccion de Bugs
**Repositorio FE:** https://github.com/Alitocoin/MiniJira-FE (branch: `test-02-bug-fixing_v01`)
**Preparado por:** Luis Barrios — Technical Writer, DevForce

---

## 1. Resumen Ejecutivo

Se evaluo la capacidad del sistema multiagente DevForce para diagnosticar y corregir un bug de tipo mismatch entre el contrato real del backend y los tipos TypeScript definidos en el frontend.

El resultado fue **exitoso en primera pasada**: el agente identifico la causa raiz sin iteraciones adicionales, aplico una solucion minima y precisa sobre 3 archivos, y produjo un commit limpio en aproximadamente 15 minutos. No se introdujeron regresiones.

El bug afectaba el renderizado de informacion de usuario y proyecto en `TaskCard`, y la asignacion de usuario al crear tareas desde `TaskModal`. Ambos defectos derivaban de la misma causa raiz: los tipos TypeScript no reflejaban la estructura plana que el backend realmente retorna en `TaskResponse`.

---

## 2. Metricas de Evaluacion

| Metrica | Resultado |
|---|---|
| **Diagnostico correcto** | SI — causa raiz identificada en primera pasada |
| **Solucion limpia (sin workarounds)** | SI — se corrigio el tipo en origen, no se parchearon los consumidores |
| **Regresiones introducidas** | NO |
| **Tests post-fix** | No aplica — no existen tests en esta etapa del proyecto |
| **Velocidad de diagnostico** | 1/5 — fix en primera pasada, sin intentos fallidos |
| **Calidad del fix** | **5/5** — causa raiz correctamente identificada; solucion minima y precisa |
| **Impacto en el resto del sistema** | Bajo — solo tipos y capa de renderizado; sin cambios en logica de negocio |

### Justificacion de calificaciones

**Calidad del fix — 5/5:** El agente identifico que el desajuste estaba en la definicion de tipos (`src/types/index.ts`), no en los componentes que los consumen. Al corregir el tipo en origen y propagar el cambio a `TaskCard` y `TaskModal`, la solucion es DRY y no introduce deuda tecnica. El campo `userId` → `assignedUserId` en `CreateTaskPayload` fue detectado como parte del mismo diagnostico, lo que demuestra un analisis exhaustivo del contrato de API y no una correccion parcial.

**Impacto bajo:** Los 3 archivos modificados pertenecen exclusivamente a la capa de tipos y presentacion. No se tocaron servicios, rutas, ni logica de estado. El resto del sistema quedo intacto.

---

## 3. Descripcion del Bug

### 3.1 Causa Raiz

El tipo `Task` en `src/types/index.ts` modelaba usuario y proyecto como objetos anidados:

```typescript
// ANTES — incorrecto
interface Task {
  assignedUser: User | null;
  project: Project | null;
  // ...
}
```

Sin embargo, el backend retorna una respuesta plana (`TaskResponse`) con campos escalares:

```json
{
  "assignedUserId": 1,
  "assignedUserName": "Ana Lopez",
  "projectId": 2,
  "projectName": "Mini Jira"
}
```

En runtime, `task.assignedUser` y `task.project` siempre eran `undefined`, por lo que la informacion de usuario y proyecto nunca se renderizaba en `TaskCard`.

Adicionalmente, `CreateTaskPayload` usaba el campo `userId`, pero el backend esperaba `assignedUserId`, lo que causaba que la asignacion de usuario se perdiera silenciosamente al crear una tarea.

### 3.2 Archivos Afectados

| Archivo | Problema | Correccion aplicada |
|---|---|---|
| `src/types/index.ts` | `Task` con campos de objeto anidado; `CreateTaskPayload` con `userId` | Reemplazado por campos planos (`assignedUserId`, `assignedUserName`, `projectId`, `projectName`); `userId` → `assignedUserId` |
| `src/components/TaskCard.tsx` | Accedia a `task.assignedUser.name` y `task.project.name` (siempre `undefined`) | Actualizado para leer `task.assignedUserName` y `task.projectName` |
| `src/components/TaskModal.tsx` | Enviaba `userId` en el payload de creacion | Actualizado para enviar `assignedUserId` |

### 3.3 Magnitud del Cambio

```
3 archivos modificados
21 inserciones (+)
14 eliminaciones (-)
```

---

## 4. Metricas de Proceso

### 4.1 Desglose de tiempo (estimado)

| Fase | Tiempo (aprox) | Descripcion |
|---|---|---|
| Lectura y diagnostico | ~5 min | Analisis de `types/index.ts`, `TaskCard.tsx`, `TaskModal.tsx` y contrato de backend |
| Implementacion del fix | ~7 min | Correccion en los 3 archivos |
| Verificacion y commit | ~3 min | Revision del cambio, mensaje de commit, push |
| **TOTAL** | **~15 min** | |

### 4.2 Metricas adicionales

| Metrica | Valor |
|---|---|
| Archivos modificados | 3 |
| Lineas agregadas | 21 |
| Lineas eliminadas | 14 |
| Iteraciones de correccion | 1 (fix directo, sin retrabajos) |
| Intentos de diagnostico | 1/5 — primera pasada |
| Rama | `test-02-bug-fixing_v01` |
| Commit | `8db7e14` |
| Fecha del commit | 2026-05-11 11:31:24 UTC |
| Agente responsable | Paula Aguilar (Frontend Developer) |

---

## 5. Descripcion Tecnica del Fix

### 5.1 Cambio en tipos (`src/types/index.ts`)

```typescript
// ANTES
interface Task {
  id: number;
  assignedUser: User | null;
  project: Project | null;
  // ...
}

interface CreateTaskPayload {
  userId: number | null;
  // ...
}

// DESPUES
interface Task {
  id: number;
  assignedUserId: number | null;
  assignedUserName: string | null;
  projectId: number | null;
  projectName: string | null;
  // ...
}

interface CreateTaskPayload {
  assignedUserId: number | null;
  // ...
}
```

### 5.2 Cambio en renderizado (`src/components/TaskCard.tsx`)

```typescript
// ANTES
<span>{task.assignedUser?.name ?? "Sin asignar"}</span>
<span>{task.project?.name ?? "Sin proyecto"}</span>

// DESPUES
<span>{task.assignedUserName ?? "Sin asignar"}</span>
<span>{task.projectName ?? "Sin proyecto"}</span>
```

### 5.3 Cambio en creacion de tarea (`src/components/TaskModal.tsx`)

```typescript
// ANTES
const payload: CreateTaskPayload = {
  userId: selectedUserId,
  // ...
};

// DESPUES
const payload: CreateTaskPayload = {
  assignedUserId: selectedUserId,
  // ...
};
```

---

## 6. Delegacion del Equipo

| Agente | Rol | Tarea en este test |
|---|---|---|
| Paula Aguilar (Frontend Developer) | React, TypeScript | Diagnostico, implementacion del fix y commit |
| Luis Barrios (Docs) | Technical Writing | Generacion de este informe de evaluacion |

**Patron de ejecucion:** El test de bug fixing se ejecuto de forma unitaria por un solo agente especializado (Paula Aguilar). No requirio coordinacion backend dado que el contrato del backend era correcto; el problema estaba enteramente en el modelado de tipos del frontend.

---

## 7. Observaciones y Conclusiones

### Fortalezas observadas

**Diagnostico en profundidad:** El agente no se limito a parchear los componentes que fallaban visualmente. Identifico que la causa estaba en la definicion de tipos y corrigio desde la raiz, evitando deuda tecnica.

**Solucion minima:** El fix modifica exactamente lo necesario (3 archivos, 35 lineas entre inserciones y eliminaciones) sin refactorizaciones adicionales que pudieran introducir riesgo.

**Doble deteccion:** El agente identifico dos bugs relacionados con la misma causa raiz: el renderizado de campos en `TaskCard` y el payload de creacion en `TaskModal`. Un diagnostico parcial habria dejado uno de los dos sin corregir.

**Sin regresiones:** El resto del sistema (rutas, estado global, llamadas a la API) no fue afectado.

### Areas de mejora

**Ausencia de tests:** No existen tests automatizados en esta etapa del proyecto. Un test de tipo para `Task` habria detectado el mismatch en tiempo de compilacion antes de llegar a runtime. Se recomienda incorporar este criterio en futuras evaluaciones.

**Validacion contra la fuente de verdad:** El fix se baso en inferencia del contrato del backend a partir de los nombres de campo. Idealmente, el agente deberia contrastar contra el DTO real del backend (`TaskResponse.java`) para garantizar precision total.

### Recomendaciones para la evaluacion

1. **El fix en primera pasada es la metrica clave.** Diagnosticar la causa raiz correctamente sin intentos fallidos es el resultado mas valioso en un test de bug fixing.

2. **Distinguir workaround de fix real.** Este test evidencia que el agente prefiere corregir la fuente del problema (el tipo incorrecto) en lugar de compensar en los consumidores. Esa diferencia debe reflejarse en la rubrica.

3. **Incluir un criterio de regresiones.** La ausencia de regresiones es un resultado positivo que merece peso explicito en la calificacion.

---

*Documento generado el 2026-05-11. Basado en analisis del codigo fuente en el repositorio MiniJira-FE, branch `test-02-bug-fixing_v01`, commit `8db7e14`, y en las metricas de proceso registradas durante el test.*
