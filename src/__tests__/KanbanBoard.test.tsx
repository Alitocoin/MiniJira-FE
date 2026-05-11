import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { KanbanBoard } from '../components/KanbanBoard'
import { AuthProvider } from '../context/AuthContext'
import type { Task } from '../types'

// Mocks de CSS
vi.mock('../components/KanbanBoard.css', () => ({}))
vi.mock('../components/KanbanColumn.css', () => ({}))
vi.mock('../components/TaskCard.css', () => ({}))
vi.mock('../components/TaskModal.css', () => ({}))

// Mock de la API completa
vi.mock('../api', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  updateTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
  fetchUsers: vi.fn(),
  fetchProjects: vi.fn(),
}))

import * as api from '../api'

const mockFetchTasks = vi.mocked(api.fetchTasks)
const mockUpdateTaskStatus = vi.mocked(api.updateTaskStatus)
const mockDeleteTask = vi.mocked(api.deleteTask)
const mockFetchUsers = vi.mocked(api.fetchUsers)
const mockFetchProjects = vi.mocked(api.fetchProjects)

const sampleTasks: Task[] = [
  {
    id: 1,
    title: 'Tarea TODO',
    description: 'Descripcion 1',
    status: 'TODO',
    storyPoints: 2,
    estimatedHours: 3,
    startDate: '2026-05-01',
    endDate: '2026-05-10',
    assignedUserId: null,
    assignedUserName: null,
    projectId: null,
    projectName: null,
  },
  {
    id: 2,
    title: 'Tarea IN_PROGRESS',
    description: 'Descripcion 2',
    status: 'IN_PROGRESS',
    storyPoints: 3,
    estimatedHours: 5,
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    assignedUserId: 1,
    assignedUserName: 'Ana Lopez',
    projectId: null,
    projectName: null,
  },
  {
    id: 3,
    title: 'Tarea DONE',
    description: 'Descripcion 3',
    status: 'DONE',
    storyPoints: 1,
    estimatedHours: 1,
    startDate: '2026-04-01',
    endDate: '2026-04-05',
    assignedUserId: null,
    assignedUserName: null,
    projectId: null,
    projectName: null,
  },
]

const renderBoard = (withToken = true) => {
  if (withToken) {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('userId', '1')
    localStorage.setItem('username', 'testuser')
  } else {
    localStorage.clear()
  }

  return render(
    <MemoryRouter>
      <AuthProvider>
        <KanbanBoard />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('KanbanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Defaults para fetchUsers y fetchProjects (usados en TaskModal)
    mockFetchUsers.mockResolvedValue([])
    mockFetchProjects.mockResolvedValue([])
  })

  // ---- Estado de carga ----

  it('debería mostrar el spinner de carga mientras carga las tareas', () => {
    mockFetchTasks.mockReturnValue(new Promise(() => {})) // nunca resuelve

    renderBoard()

    expect(screen.getByText(/cargando tareas/i)).toBeInTheDocument()
  })

  // ---- Carga exitosa ----

  it('debería mostrar las tres columnas después de cargar', async () => {
    mockFetchTasks.mockResolvedValue(sampleTasks)

    renderBoard()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Por hacer' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'En progreso' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Terminada' })).toBeInTheDocument()
    })
  })

  it('debería mostrar las tareas en sus columnas correctas', async () => {
    mockFetchTasks.mockResolvedValue(sampleTasks)

    renderBoard()

    await waitFor(() => {
      expect(screen.getByText('Tarea TODO')).toBeInTheDocument()
      expect(screen.getByText('Tarea IN_PROGRESS')).toBeInTheDocument()
      expect(screen.getByText('Tarea DONE')).toBeInTheDocument()
    })
  })

  it('debería mostrar columnas vacías cuando fetchTasks devuelve []', async () => {
    mockFetchTasks.mockResolvedValue([])

    renderBoard()

    await waitFor(() => {
      const emptyMessages = screen.getAllByText('Sin tareas')
      expect(emptyMessages).toHaveLength(3)
    })
  })

  // ---- Error al cargar ----

  it('debería mostrar mensaje de error cuando fetchTasks falla', async () => {
    mockFetchTasks.mockRejectedValue(new Error('Error de conexión'))

    renderBoard()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Error de conexión')
    })
  })

  it('debería mostrar error genérico cuando el error no es instancia de Error', async () => {
    mockFetchTasks.mockRejectedValue('error no tipado')

    renderBoard()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error al cargar las tareas.')
    })
  })

  it('debería poder cerrar el banner de error', async () => {
    mockFetchTasks.mockRejectedValue(new Error('Error cargando'))

    renderBoard()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /cerrar error/i }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  // ---- Header ----

  it('debería mostrar el nombre del usuario logueado', async () => {
    mockFetchTasks.mockResolvedValue([])

    renderBoard(true)

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
  })

  it('debería mostrar el botón "Salir"', async () => {
    mockFetchTasks.mockResolvedValue([])

    renderBoard(true)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /salir/i })).toBeInTheDocument()
    })
  })

  // ---- Botón "Nueva tarea" (header) ----

  it('debería abrir el modal al hacer clic en "+ Nueva tarea"', async () => {
    mockFetchTasks.mockResolvedValue([])

    renderBoard()

    await waitFor(() => {
      expect(screen.queryByText(/cargando tareas/i)).not.toBeInTheDocument()
    })

    // Primer botón "Nueva tarea" es el del header
    const newTaskBtns = screen.getAllByRole('button', { name: /nueva tarea/i })
    await userEvent.click(newTaskBtns[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  // ---- Actualización optimista de estado ----

  it('debería actualizar el status de una tarea de forma optimista', async () => {
    mockFetchTasks.mockResolvedValue([sampleTasks[0]])
    mockUpdateTaskStatus.mockResolvedValue({ ...sampleTasks[0], status: 'IN_PROGRESS' })

    renderBoard()

    await waitFor(() => {
      expect(screen.getByText('Tarea TODO')).toBeInTheDocument()
    })

    // Clic en "mover al estado siguiente"
    await userEvent.click(screen.getByRole('button', { name: /mover al estado siguiente/i }))

    await waitFor(() => {
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(1, 'IN_PROGRESS')
    })
  })

  // ---- Botón de recarga ----

  it('debería recargar tareas al hacer clic en el botón de recargar', async () => {
    mockFetchTasks.mockResolvedValue([])

    renderBoard()

    await waitFor(() => {
      expect(mockFetchTasks).toHaveBeenCalledTimes(1)
    })

    await userEvent.click(screen.getByRole('button', { name: /recargar tablero/i }))

    await waitFor(() => {
      expect(mockFetchTasks).toHaveBeenCalledTimes(2)
    })
  })

  // ---- Confirmación de eliminación ----

  it('debería llamar deleteTask cuando el usuario confirma eliminar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockFetchTasks.mockResolvedValue([sampleTasks[0]])
    mockDeleteTask.mockResolvedValue(undefined)

    renderBoard()

    await waitFor(() => {
      expect(screen.getByText('Tarea TODO')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /eliminar tarea/i }))

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith(1)
    })

    vi.restoreAllMocks()
  })

  it('no debería llamar deleteTask cuando el usuario cancela la confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    mockFetchTasks.mockResolvedValue([sampleTasks[0]])

    renderBoard()

    await waitFor(() => {
      expect(screen.getByText('Tarea TODO')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /eliminar tarea/i }))

    expect(mockDeleteTask).not.toHaveBeenCalled()

    vi.restoreAllMocks()
  })
})
