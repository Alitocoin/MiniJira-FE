import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KanbanColumn } from '../components/KanbanColumn'
import type { Task } from '../types'

vi.mock('../components/KanbanColumn.css', () => ({}))
vi.mock('../components/TaskCard.css', () => ({}))

const makeTasks = (count: number, status: 'TODO' | 'IN_PROGRESS' | 'DONE' = 'TODO'): Task[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Tarea ${i + 1}`,
    description: `Descripcion ${i + 1}`,
    status,
    storyPoints: i + 1,
    estimatedHours: 2,
    startDate: '2026-05-01',
    endDate: '2026-05-10',
    assignedUserId: null,
    assignedUserName: null,
    projectId: null,
    projectName: null,
  }))

describe('KanbanColumn', () => {
  // ---- Renderizado básico ----

  it('debería mostrar label "Por hacer" para columna TODO', () => {
    render(
      <KanbanColumn
        status="TODO"
        tasks={[]}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={vi.fn()}
      />
    )
    expect(screen.getByRole('heading', { name: 'Por hacer' })).toBeInTheDocument()
  })

  it('debería mostrar label "En progreso" para columna IN_PROGRESS', () => {
    render(
      <KanbanColumn
        status="IN_PROGRESS"
        tasks={[]}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={vi.fn()}
      />
    )
    expect(screen.getByRole('heading', { name: 'En progreso' })).toBeInTheDocument()
  })

  it('debería mostrar label "Terminada" para columna DONE', () => {
    render(
      <KanbanColumn
        status="DONE"
        tasks={[]}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={vi.fn()}
      />
    )
    expect(screen.getByRole('heading', { name: 'Terminada' })).toBeInTheDocument()
  })

  it('debería mostrar el contador de tareas correcto', () => {
    const tasks = makeTasks(3)
    render(
      <KanbanColumn
        status="TODO"
        tasks={tasks}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={vi.fn()}
      />
    )
    // El span de contador tiene aria-label "3 tareas"
    expect(screen.getByLabelText('3 tareas')).toBeInTheDocument()
  })

  it('debería mostrar contador 0 cuando no hay tareas', () => {
    render(
      <KanbanColumn
        status="TODO"
        tasks={[]}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={vi.fn()}
      />
    )
    expect(screen.getByLabelText('0 tareas')).toBeInTheDocument()
  })

  // ---- Estado vacío ----

  it('debería mostrar "Sin tareas" cuando el array de tareas está vacío', () => {
    render(
      <KanbanColumn
        status="TODO"
        tasks={[]}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={vi.fn()}
      />
    )
    expect(screen.getByText('Sin tareas')).toBeInTheDocument()
  })

  it('no debería mostrar "Sin tareas" cuando hay tareas', () => {
    const tasks = makeTasks(1)
    render(
      <KanbanColumn
        status="TODO"
        tasks={tasks}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={vi.fn()}
      />
    )
    expect(screen.queryByText('Sin tareas')).not.toBeInTheDocument()
  })

  // ---- Renderizado de TaskCards ----

  it('debería renderizar todas las tareas como items de lista', () => {
    const tasks = makeTasks(3)
    render(
      <KanbanColumn
        status="TODO"
        tasks={tasks}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={vi.fn()}
      />
    )
    expect(screen.getByText('Tarea 1')).toBeInTheDocument()
    expect(screen.getByText('Tarea 2')).toBeInTheDocument()
    expect(screen.getByText('Tarea 3')).toBeInTheDocument()
  })

  it('debería renderizar exactamente N listitem cuando hay N tareas', () => {
    const tasks = makeTasks(4)
    render(
      <KanbanColumn
        status="TODO"
        tasks={tasks}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={vi.fn()}
      />
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  // ---- Botón "Nueva tarea" ----

  it('debería renderizar el botón de agregar tarea con aria-label correcto', () => {
    render(
      <KanbanColumn
        status="TODO"
        tasks={[]}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /agregar tarea en por hacer/i })).toBeInTheDocument()
  })

  it('debería llamar onAddTask al hacer clic en el botón de nueva tarea', async () => {
    const onAddTask = vi.fn()
    render(
      <KanbanColumn
        status="TODO"
        tasks={[]}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={onAddTask}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /agregar tarea en por hacer/i }))

    expect(onAddTask).toHaveBeenCalledTimes(1)
  })

  it('debería tener aria-label de sección correcto', () => {
    render(
      <KanbanColumn
        status="IN_PROGRESS"
        tasks={[]}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onAddTask={vi.fn()}
      />
    )
    expect(screen.getByRole('region', { name: /columna en progreso/i })).toBeInTheDocument()
  })
})
