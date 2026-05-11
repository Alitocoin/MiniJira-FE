# Test 01: Desarrollo Fullstack - Mini Jira

## Objetivo
Evaluar la capacidad de la IA para construir un sistema completo con backend, base de datos y frontend siguiendo buenas prácticas.

## Contexto
Se requiere construir una aplicación tipo Mini Jira con funcionalidades básicas de gestión de tareas.

## Tarea
Implementar un sistema con:

### Backend
- API REST en Java (Spring Boot)
- Entidades:
  - User
  - Task
  - Project
- Campos de Task:
  - title
  - description
  - status (TODO, IN_PROGRESS, DONE)
  - storyPoints
  - estimatedHours
  - startDate
  - endDate
- Relación Task → User
- CRUD completo de tareas

### Base de datos
- PostgreSQL
- Uso de JPA/Hibernate

### Frontend
- Aplicación en React
- Vista tipo Kanban (3 columnas)
- Crear, mover y listar tareas

## Restricciones
- Usar arquitectura en capas (Controller, Service, Repository)
- Aplicar principios SOLID
- Manejo de errores adecuado
- No hardcodear valores
- Código limpio y modular

## Resultado esperado
- Backend funcional
- Frontend funcional conectado a API
- Persistencia en base de datos
- Flujo completo de creación y visualización de tareas

## Métricas de evaluación
- Compila: sí/no
- Funciona: sí/no
- Arquitectura: 1–5
- Calidad de código: 1–5
- Tiempo de implementación: minutos
- Número de iteraciones: #

# Métricas durante el proceso
- Medir tiempo de proceso
- Mostrar pasos realizados
- Generar documento de documentación para complemento de informe de evaluación de herramienta de IA
- Genera métricas que creas que puedan ayudar a esta evaluación