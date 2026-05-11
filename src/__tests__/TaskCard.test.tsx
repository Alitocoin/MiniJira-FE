import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from '../components/TaskCard'
import type { Task } from '../types'

// Evitamos importar CSS en tests
vi.mock('../components/TaskCard.css', () => ({}))

const baseTask: Task = {
  id: 1,
  title: 'Implementar login',
  description: 'Crear pantalla de login con JWT',
  status: 'TODO',
  storyPoints: 3,
  estimatedHours: 5,
  startDate: '2026-05-01',
  endDate: '2026-05-10',
  assignedUserId: null,
  assignedUserName: null,
  projectId: null,
  projectName: null,
}

describe('TaskCard', () => {
  // ---- Renderizado básico ----

  it('debería renderizar el título de la tarea', () => {
    render(<TaskCard task={baseTask} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Implementar login')).toBeInTheDocument()
  })

  it('debería renderizar la descripción truncada (máx 80 chars)', () => {
    const longDesc = 'A'.repeat(90)
    const task = { ...baseTask, description: longDesc }

    render(<TaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)

    // La descripción debe estar truncada a 80 + '...'
    const displayed = screen.getByText(`${'A'.repeat(80)}...`)
    expect(displayed).toBeInTheDocument()
  })

  it('debería renderizar descripción completa cuando es menor a 80 chars', () => {
    render(<TaskCard task={baseTask} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Crear pantalla de login con JWT')).toBeInTheDocument()
  })

  it('debería mostrar story points cuando existen', () => {
    render(<TaskCard task={baseTask} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('SP 3')).toBeInTheDocument()
  })

  it('debería mostrar "SP —" cuando storyPoints es null', () => {
    const task = { ...baseTask, storyPoints: null }
    render(<TaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('SP —')).toBeInTheDocument()
  })

  it('no debería renderizar descripción cuando está vacía', () => {
    const task = { ...baseTask, description: '' }
    render(<TaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    // El párrafo de descripción no debe estar en el DOM
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })

  it('debería mostrar el nombre del usuario asignado cuando existe', () => {
    const task = { ...baseTask, assignedUserId: 1, assignedUserName: 'Ana Lopez' }
    render(<TaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Ana Lopez')).toBeInTheDocument()
  })

  it('debería mostrar el nombre del proyecto cuando existe', () => {
    const task = { ...baseTask, projectId: 2, projectName: 'Proyecto Alpha' }
    render(<TaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Proyecto Alpha')).toBeInTheDocument()
  })

  it('no debería mostrar usuario asignado cuando es null', () => {
    render(<TaskCard task={baseTask} onMove={vi.fn()} onDelete={vi.fn()} />)
    // No hay span de usuario si assignedUserName es null
    expect(screen.queryByText('Ana Lopez')).not.toBeInTheDocument()
  })

  // ---- Badge de estado ----

  it('debería mostrar badge "Por hacer" para status TODO', () => {
    render(<TaskCard task={baseTask} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Por hacer')).toBeInTheDocument()
  })

  it('debería mostrar badge "En progreso" para status IN_PROGRESS', () => {
    const task = { ...baseTask, status: 'IN_PROGRESS' as const }
    render(<TaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('En progreso')).toBeInTheDocument()
  })

  it('debería mostrar badge "Terminada" para status DONE', () => {
    const task = { ...baseTask, status: 'DONE' as const }
    render(<TaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Terminada')).toBeInTheDocument()
  })

  // ---- Botones de movimiento ----

  it('debería deshabilitar botón "atrás" cuando el status es TODO (primer estado)', () => {
    render(<TaskCard task={baseTask} onMove={vi.fn()} onDelete={vi.fn()} />)
    const prevBtn = screen.getByRole('button', { name: /mover al estado anterior/i })
    expect(prevBtn).toBeDisabled()
  })

  it('debería deshabilitar botón "adelante" cuando el status es DONE (último estado)', () => {
    const task = { ...baseTask, status: 'DONE' as const }
    render(<TaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    const nextBtn = screen.getByRole('button', { name: /mover al estado siguiente/i })
    expect(nextBtn).toBeDisabled()
  })

  it('debería habilitar ambos botones de movimiento cuando el status es IN_PROGRESS', () => {
    const task = { ...baseTask, status: 'IN_PROGRESS' as const }
    render(<TaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    const prevBtn = screen.getByRole('button', { name: /mover al estado anterior/i })
    const nextBtn = screen.getByRole('button', { name: /mover al estado siguiente/i })
    expect(prevBtn).not.toBeDisabled()
    expect(nextBtn).not.toBeDisabled()
  })

  // ---- Interacciones ----

  it('debería llamar onMove con status TODO→IN_PROGRESS al hacer clic en adelante', async () => {
    const onMove = vi.fn()
    render(<TaskCard task={baseTask} onMove={onMove} onDelete={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /mover al estado siguiente/i }))

    expect(onMove).toHaveBeenCalledWith(1, 'IN_PROGRESS')
  })

  it('debería llamar onMove con IN_PROGRESS→TODO al hacer clic en atrás', async () => {
    const onMove = vi.fn()
    const task = { ...baseTask, status: 'IN_PROGRESS' as const }
    render(<TaskCard task={task} onMove={onMove} onDelete={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /mover al estado anterior/i }))

    expect(onMove).toHaveBeenCalledWith(1, 'TODO')
  })

  it('debería llamar onMove con IN_PROGRESS→DONE al hacer clic en adelante', async () => {
    const onMove = vi.fn()
    const task = { ...baseTask, status: 'IN_PROGRESS' as const }
    render(<TaskCard task={task} onMove={onMove} onDelete={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /mover al estado siguiente/i }))

    expect(onMove).toHaveBeenCalledWith(1, 'DONE')
  })

  it('debería llamar onDelete con el id correcto al hacer clic en eliminar', async () => {
    const onDelete = vi.fn()
    render(<TaskCard task={baseTask} onMove={vi.fn()} onDelete={onDelete} />)

    await userEvent.click(screen.getByRole('button', { name: /eliminar tarea/i }))

    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('no debería llamar onMove al hacer clic en "atrás" desde TODO', async () => {
    const onMove = vi.fn()
    render(<TaskCard task={baseTask} onMove={onMove} onDelete={vi.fn()} />)

    // El botón está deshabilitado, el click no debe disparar nada
    const prevBtn = screen.getByRole('button', { name: /mover al estado anterior/i })
    await userEvent.click(prevBtn)

    expect(onMove).not.toHaveBeenCalled()
  })
})
