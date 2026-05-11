import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Task, User, Project } from '../types'

// Mock del módulo axiosInstance antes de importar api
vi.mock('../api/axiosInstance', () => {
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
  return { default: instance }
})

// Importar después del mock
import axiosInstance from '../api/axiosInstance'
import {
  fetchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  fetchUsers,
  fetchProjects,
} from '../api'

const mockAxios = axiosInstance as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const mockTask: Task = {
  id: 1,
  title: 'Tarea de prueba',
  description: 'Descripcion de prueba',
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

const mockCreatePayload = {
  title: 'Nueva tarea',
  description: 'Desc',
  status: 'TODO' as const,
  storyPoints: 2,
  estimatedHours: 4,
  startDate: '2026-05-01',
  endDate: '2026-05-05',
  assignedUserId: null,
  projectId: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ============================================================
// fetchTasks
// ============================================================
describe('fetchTasks', () => {
  it('debería hacer GET /api/v1/tasks y retornar el array de tareas', async () => {
    const tasks: Task[] = [mockTask]
    mockAxios.get.mockResolvedValueOnce({ data: tasks })

    const result = await fetchTasks()

    expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/tasks')
    expect(result).toEqual(tasks)
  })

  it('debería retornar array vacío cuando el backend devuelve []', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [] })

    const result = await fetchTasks()

    expect(result).toEqual([])
  })

  it('debería propagar error cuando el servidor responde con 500', async () => {
    const serverError = Object.assign(new Error('Server Error'), {
      response: { status: 500 },
    })
    mockAxios.get.mockRejectedValueOnce(serverError)

    await expect(fetchTasks()).rejects.toThrow('Server Error')
  })

  it('debería propagar error de red (sin conexión)', async () => {
    const networkError = new Error('Network Error')
    mockAxios.get.mockRejectedValueOnce(networkError)

    await expect(fetchTasks()).rejects.toThrow('Network Error')
  })
})

// ============================================================
// createTask
// ============================================================
describe('createTask', () => {
  it('debería hacer POST /api/v1/tasks con el payload correcto', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: mockTask })

    const result = await createTask(mockCreatePayload)

    expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/tasks', mockCreatePayload)
    expect(result).toEqual(mockTask)
  })

  it('debería propagar error 400 cuando el payload es inválido', async () => {
    const badRequestError = Object.assign(new Error('Bad Request'), {
      response: { status: 400 },
    })
    mockAxios.post.mockRejectedValueOnce(badRequestError)

    await expect(createTask(mockCreatePayload)).rejects.toThrow('Bad Request')
  })

  it('debería propagar error 401 cuando no hay autenticación', async () => {
    const authError = Object.assign(new Error('Unauthorized'), {
      response: { status: 401 },
    })
    mockAxios.post.mockRejectedValueOnce(authError)

    await expect(createTask(mockCreatePayload)).rejects.toThrow('Unauthorized')
  })
})

// ============================================================
// updateTask
// ============================================================
describe('updateTask', () => {
  it('debería hacer PUT /api/v1/tasks/:id con el payload parcial', async () => {
    const updatedTask = { ...mockTask, title: 'Titulo actualizado' }
    mockAxios.put.mockResolvedValueOnce({ data: updatedTask })

    const result = await updateTask(1, { title: 'Titulo actualizado' })

    expect(mockAxios.put).toHaveBeenCalledWith('/api/v1/tasks/1', { title: 'Titulo actualizado' })
    expect(result.title).toBe('Titulo actualizado')
  })

  it('debería propagar error 404 cuando la tarea no existe', async () => {
    const notFoundError = Object.assign(new Error('Not Found'), {
      response: { status: 404 },
    })
    mockAxios.put.mockRejectedValueOnce(notFoundError)

    await expect(updateTask(9999, { title: 'x' })).rejects.toThrow('Not Found')
  })
})

// ============================================================
// updateTaskStatus
// ============================================================
describe('updateTaskStatus', () => {
  it('debería hacer PATCH /api/v1/tasks/:id/status con el status correcto', async () => {
    const patchedTask = { ...mockTask, status: 'IN_PROGRESS' as const }
    mockAxios.patch.mockResolvedValueOnce({ data: patchedTask })

    const result = await updateTaskStatus(1, 'IN_PROGRESS')

    expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/tasks/1/status', {
      status: 'IN_PROGRESS',
    })
    expect(result.status).toBe('IN_PROGRESS')
  })

  it('debería hacer PATCH correcto para status DONE', async () => {
    const doneTask = { ...mockTask, status: 'DONE' as const }
    mockAxios.patch.mockResolvedValueOnce({ data: doneTask })

    const result = await updateTaskStatus(1, 'DONE')

    expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/tasks/1/status', { status: 'DONE' })
    expect(result.status).toBe('DONE')
  })

  it('debería propagar error 5xx del servidor', async () => {
    mockAxios.patch.mockRejectedValueOnce(
      Object.assign(new Error('Internal Server Error'), { response: { status: 500 } })
    )

    await expect(updateTaskStatus(1, 'DONE')).rejects.toThrow('Internal Server Error')
  })
})

// ============================================================
// deleteTask
// ============================================================
describe('deleteTask', () => {
  it('debería hacer DELETE /api/v1/tasks/:id', async () => {
    mockAxios.delete.mockResolvedValueOnce({ data: undefined })

    await deleteTask(1)

    expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/tasks/1')
  })

  it('debería retornar void en éxito', async () => {
    mockAxios.delete.mockResolvedValueOnce({ data: undefined })

    const result = await deleteTask(1)

    expect(result).toBeUndefined()
  })

  it('debería propagar error 403 cuando no hay permisos', async () => {
    mockAxios.delete.mockRejectedValueOnce(
      Object.assign(new Error('Forbidden'), { response: { status: 403 } })
    )

    await expect(deleteTask(1)).rejects.toThrow('Forbidden')
  })
})

// ============================================================
// fetchUsers
// ============================================================
describe('fetchUsers', () => {
  it('debería hacer GET /api/v1/users y retornar array de usuarios', async () => {
    const users: User[] = [{ id: 1, name: 'Ana Lopez', email: 'ana@test.com' }]
    mockAxios.get.mockResolvedValueOnce({ data: users })

    const result = await fetchUsers()

    expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/users')
    expect(result).toEqual(users)
  })

  it('debería retornar array vacío cuando no hay usuarios', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [] })

    const result = await fetchUsers()

    expect(result).toEqual([])
  })

  it('debería propagar error de red', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('Network Error'))

    await expect(fetchUsers()).rejects.toThrow('Network Error')
  })
})

// ============================================================
// fetchProjects
// ============================================================
describe('fetchProjects', () => {
  it('debería hacer GET /api/v1/projects y retornar proyectos', async () => {
    const projects: Project[] = [
      { id: 1, name: 'Proyecto Alpha', description: 'Primer proyecto' },
    ]
    mockAxios.get.mockResolvedValueOnce({ data: projects })

    const result = await fetchProjects()

    expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/projects')
    expect(result).toEqual(projects)
  })

  it('debería retornar array vacío cuando no hay proyectos', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [] })

    const result = await fetchProjects()

    expect(result).toEqual([])
  })
})
