import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskModal } from '../components/TaskModal'
import type { User, Project } from '../types'

vi.mock('../components/TaskModal.css', () => ({}))

// Mock de fetchUsers y fetchProjects
vi.mock('../api', () => ({
  fetchUsers: vi.fn(),
  fetchProjects: vi.fn(),
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  updateTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
}))

import { fetchUsers, fetchProjects } from '../api'

const mockFetchUsers = fetchUsers as ReturnType<typeof vi.fn>
const mockFetchProjects = fetchProjects as ReturnType<typeof vi.fn>

const mockUsers: User[] = [
  { id: 1, name: 'Ana Lopez', email: 'ana@test.com' },
  { id: 2, name: 'Carlos Ruiz', email: 'carlos@test.com' },
]

const mockProjects: Project[] = [
  { id: 1, name: 'Proyecto Alpha', description: 'Primer proyecto' },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchUsers.mockResolvedValue(mockUsers)
  mockFetchProjects.mockResolvedValue(mockProjects)
})

describe('TaskModal', () => {
  // ---- Renderizado inicial ----

  it('debería renderizar el título "Nueva tarea"', async () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /nueva tarea/i })).toBeInTheDocument()
  })

  it('debería renderizar el campo de título', () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByLabelText(/titulo/i)).toBeInTheDocument()
  })

  it('debería renderizar el campo de descripción', () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByLabelText(/descripcion/i)).toBeInTheDocument()
  })

  it('debería renderizar el select de estado con opciones correctas', () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByRole('option', { name: 'Por hacer' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'En progreso' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Terminada' })).toBeInTheDocument()
  })

  it('debería mostrar el initialStatus pasado como prop en el select', () => {
    render(<TaskModal initialStatus="IN_PROGRESS" onClose={vi.fn()} onSubmit={vi.fn()} />)
    const select = screen.getByLabelText(/estado/i) as HTMLSelectElement
    expect(select.value).toBe('IN_PROGRESS')
  })

  it('debería usar "TODO" como initialStatus por defecto', () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)
    const select = screen.getByLabelText(/estado/i) as HTMLSelectElement
    expect(select.value).toBe('TODO')
  })

  it('debería cargar usuarios y proyectos al montar', async () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)

    await waitFor(() => {
      expect(mockFetchUsers).toHaveBeenCalledTimes(1)
      expect(mockFetchProjects).toHaveBeenCalledTimes(1)
    })
  })

  it('debería mostrar los usuarios cargados en el select', async () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Ana Lopez' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Carlos Ruiz' })).toBeInTheDocument()
    })
  })

  it('debería mostrar los proyectos cargados en el select', async () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Proyecto Alpha' })).toBeInTheDocument()
    })
  })

  it('debería tener selects de usuario y proyecto deshabilitados mientras carga', () => {
    // Retrasamos la resolución para capturar el estado de carga
    mockFetchUsers.mockReturnValue(new Promise(() => {})) // promise que nunca resuelve
    mockFetchProjects.mockReturnValue(new Promise(() => {}))

    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)

    const userSelect = screen.getByLabelText(/usuario asignado/i)
    const projectSelect = screen.getByLabelText(/proyecto/i)
    expect(userSelect).toBeDisabled()
    expect(projectSelect).toBeDisabled()
  })

  it('debería mostrar opciones vacías "Sin asignar" y "Sin proyecto"', async () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)

    expect(screen.getByRole('option', { name: 'Sin asignar' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Sin proyecto' })).toBeInTheDocument()
  })

  // ---- Validación de formulario vacío ----

  it('debería mostrar error "El titulo es requerido." al enviar sin título', async () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /crear tarea/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('El titulo es requerido.')
  })

  it('debería mostrar error cuando el título contiene solo espacios', async () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/titulo/i), '   ')
    await userEvent.click(screen.getByRole('button', { name: /crear tarea/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('El titulo es requerido.')
  })

  // ---- Envío exitoso ----

  it('debería llamar onSubmit con el payload correcto cuando el formulario es válido', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<TaskModal onClose={vi.fn()} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/titulo/i), 'Mi nueva tarea')
    await userEvent.click(screen.getByRole('button', { name: /crear tarea/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    const payload = onSubmit.mock.calls[0][0]
    expect(payload.title).toBe('Mi nueva tarea')
    expect(payload.status).toBe('TODO')
  })

  it('debería llamar onClose después de un envío exitoso', async () => {
    const onClose = vi.fn()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<TaskModal onClose={onClose} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/titulo/i), 'Tarea valida')
    await userEvent.click(screen.getByRole('button', { name: /crear tarea/i }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('debería enviar assignedUserId y projectId como null cuando no se seleccionan', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<TaskModal onClose={vi.fn()} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/titulo/i), 'Tarea sin asignar')
    await userEvent.click(screen.getByRole('button', { name: /crear tarea/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })

    const payload = onSubmit.mock.calls[0][0]
    expect(payload.assignedUserId).toBeNull()
    expect(payload.projectId).toBeNull()
  })

  it('debería enviar storyPoints = 0 cuando el campo está vacío', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<TaskModal onClose={vi.fn()} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/titulo/i), 'Tarea sin SP')
    await userEvent.click(screen.getByRole('button', { name: /crear tarea/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })

    const payload = onSubmit.mock.calls[0][0]
    expect(payload.storyPoints).toBe(0)
    expect(payload.estimatedHours).toBe(0)
  })

  // ---- Error en onSubmit ----

  it('debería mostrar error cuando onSubmit rechaza', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Error del servidor'))

    render(<TaskModal onClose={vi.fn()} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/titulo/i), 'Tarea que falla')
    await userEvent.click(screen.getByRole('button', { name: /crear tarea/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error del servidor')
    })
  })

  it('debería mostrar texto genérico de error cuando el error no es instancia de Error', async () => {
    const onSubmit = vi.fn().mockRejectedValue('string error')

    render(<TaskModal onClose={vi.fn()} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/titulo/i), 'Tarea fallida')
    await userEvent.click(screen.getByRole('button', { name: /crear tarea/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error al crear la tarea.')
    })
  })

  // ---- Cierre del modal ----

  it('debería llamar onClose al hacer clic en el botón "Cancelar"', async () => {
    const onClose = vi.fn()
    render(<TaskModal onClose={onClose} onSubmit={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('debería llamar onClose al hacer clic en el botón X (cerrar)', async () => {
    const onClose = vi.fn()
    render(<TaskModal onClose={onClose} onSubmit={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /cerrar modal/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('debería llamar onClose al presionar la tecla Escape', async () => {
    const onClose = vi.fn()
    render(<TaskModal onClose={onClose} onSubmit={vi.fn()} />)

    await userEvent.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // ---- Estado de carga durante envío ----

  it('debería deshabilitar el botón submit mientras se está enviando', async () => {
    let resolveSubmit: () => void
    const onSubmit = vi.fn(
      () => new Promise<void>((resolve) => { resolveSubmit = resolve })
    )

    render(<TaskModal onClose={vi.fn()} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/titulo/i), 'Tarea en proceso')
    await userEvent.click(screen.getByRole('button', { name: /crear tarea/i }))

    // Durante la espera, el botón debe mostrar "Creando..."
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creando/i })).toBeDisabled()
    })

    resolveSubmit!()
  })

  // ---- Manejo de error al cargar usuarios/proyectos ----

  it('debería continuar funcionando si fetchUsers y fetchProjects fallan', async () => {
    mockFetchUsers.mockRejectedValue(new Error('No se pudo cargar usuarios'))
    mockFetchProjects.mockRejectedValue(new Error('No se pudo cargar proyectos'))

    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} />)

    // Esperar a que el loading termine
    await waitFor(() => {
      const userSelect = screen.getByLabelText(/usuario asignado/i)
      expect(userSelect).not.toBeDisabled()
    })

    // El modal debe seguir mostrándose sin crash
    expect(screen.getByLabelText(/titulo/i)).toBeInTheDocument()
  })
})
