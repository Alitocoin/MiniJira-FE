import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import type { Task } from '../types';

// Mock del módulo axios completo
vi.mock('axios');

// Helpers para construir mocks de axios
const mockAxiosCreate = () => {
  const mockClient = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return mockClient;
};

// Dado que api.ts usa axios.create() en el módulo, necesitamos mockear
// el cliente creado. Usamos un enfoque de re-importación con mock factory.
describe('api.ts — funciones de consumo HTTP', () => {
  let mockClient: ReturnType<typeof mockAxiosCreate>;

  beforeEach(async () => {
    vi.resetModules();
    mockClient = mockAxiosCreate();
    vi.mocked(axios.create).mockReturnValue(mockClient as unknown as ReturnType<typeof axios.create>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ //
  // getTasks
  // ------------------------------------------------------------------ //

  describe('getTasks', () => {
    it('hace GET a /tasks y devuelve la lista de tareas', async () => {
      const tasks: Task[] = [
        {
          id: 1,
          title: 'Tarea test',
          description: '',
          status: 'TODO',
          storyPoints: null,
          estimatedHours: null,
          startDate: null,
          endDate: null,
          assignee: null,
          project: null,
          createdAt: '2026-01-01T00:00:00',
        },
      ];
      mockClient.get.mockResolvedValueOnce({ data: tasks });

      const { getTasks } = await import('../api');
      const result = await getTasks();

      expect(mockClient.get).toHaveBeenCalledWith('/tasks');
      expect(result).toEqual(tasks);
      expect(result).toHaveLength(1);
    });

    it('devuelve lista vacía cuando el backend responde con []', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [] });

      const { getTasks } = await import('../api');
      const result = await getTasks();

      expect(result).toEqual([]);
    });

    it('propaga error de red cuando la petición falla', async () => {
      const networkError = new Error('Network Error');
      mockClient.get.mockRejectedValueOnce(networkError);

      const { getTasks } = await import('../api');

      await expect(getTasks()).rejects.toThrow('Network Error');
    });
  });

  // ------------------------------------------------------------------ //
  // updateTaskStatus
  // ------------------------------------------------------------------ //

  describe('updateTaskStatus', () => {
    it('hace PATCH a /tasks/{id}/status con el status correcto', async () => {
      const updatedTask: Task = {
        id: 5,
        title: 'Tarea actualizada',
        description: '',
        status: 'IN_PROGRESS',
        storyPoints: null,
        estimatedHours: null,
        startDate: null,
        endDate: null,
        assignee: null,
        project: null,
        createdAt: '2026-01-01T00:00:00',
      };
      mockClient.patch.mockResolvedValueOnce({ data: updatedTask });

      const { updateTaskStatus } = await import('../api');
      const result = await updateTaskStatus(5, 'IN_PROGRESS');

      expect(mockClient.patch).toHaveBeenCalledWith('/tasks/5/status', {
        status: 'IN_PROGRESS',
      });
      expect(result.status).toBe('IN_PROGRESS');
      expect(result.id).toBe(5);
    });

    it('hace PATCH con status DONE correctamente', async () => {
      const doneTask: Task = {
        id: 10,
        title: 'Completada',
        description: '',
        status: 'DONE',
        storyPoints: 5,
        estimatedHours: 8,
        startDate: null,
        endDate: null,
        assignee: null,
        project: null,
        createdAt: '2026-01-01T00:00:00',
      };
      mockClient.patch.mockResolvedValueOnce({ data: doneTask });

      const { updateTaskStatus } = await import('../api');
      const result = await updateTaskStatus(10, 'DONE');

      expect(mockClient.patch).toHaveBeenCalledWith('/tasks/10/status', {
        status: 'DONE',
      });
      expect(result.status).toBe('DONE');
    });

    it('propaga error de red al actualizar status', async () => {
      mockClient.patch.mockRejectedValueOnce(new Error('Connection refused'));

      const { updateTaskStatus } = await import('../api');

      await expect(updateTaskStatus(1, 'DONE')).rejects.toThrow(
        'Connection refused'
      );
    });

    it('propaga error 404 cuando la tarea no existe', async () => {
      const notFoundError = Object.assign(new Error('Not Found'), {
        response: { status: 404, data: { message: 'Task con id 999 no encontrado' } },
      });
      mockClient.patch.mockRejectedValueOnce(notFoundError);

      const { updateTaskStatus } = await import('../api');

      await expect(updateTaskStatus(999, 'DONE')).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  // ------------------------------------------------------------------ //
  // createTask
  // ------------------------------------------------------------------ //

  describe('createTask', () => {
    it('hace POST a /tasks con los datos correctos', async () => {
      const newTask: Task = {
        id: 20,
        title: 'Nueva tarea',
        description: 'Descripción',
        status: 'TODO',
        storyPoints: 3,
        estimatedHours: 4,
        startDate: null,
        endDate: null,
        assignee: null,
        project: null,
        createdAt: '2026-01-01T00:00:00',
      };
      mockClient.post.mockResolvedValueOnce({ data: newTask });

      const { createTask } = await import('../api');
      const payload = {
        title: 'Nueva tarea',
        description: 'Descripción',
        status: 'TODO' as const,
        storyPoints: 3,
        estimatedHours: 4,
      };
      const result = await createTask(payload);

      expect(mockClient.post).toHaveBeenCalledWith('/tasks', payload);
      expect(result.title).toBe('Nueva tarea');
    });
  });

  // ------------------------------------------------------------------ //
  // deleteTask
  // ------------------------------------------------------------------ //

  describe('deleteTask', () => {
    it('hace DELETE a /tasks/{id} y resuelve void', async () => {
      mockClient.delete.mockResolvedValueOnce({});

      const { deleteTask } = await import('../api');
      const result = await deleteTask(3);

      expect(mockClient.delete).toHaveBeenCalledWith('/tasks/3');
      expect(result).toBeUndefined();
    });

    it('propaga error 404 al intentar eliminar tarea inexistente', async () => {
      const error = Object.assign(new Error('Not Found'), {
        response: { status: 404 },
      });
      mockClient.delete.mockRejectedValueOnce(error);

      const { deleteTask } = await import('../api');

      await expect(deleteTask(999)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  // ------------------------------------------------------------------ //
  // getUsers
  // ------------------------------------------------------------------ //

  describe('getUsers', () => {
    it('hace GET a /users y devuelve lista de usuarios', async () => {
      const users = [{ id: 1, username: 'alice', email: 'alice@test.com' }];
      mockClient.get.mockResolvedValueOnce({ data: users });

      const { getUsers } = await import('../api');
      const result = await getUsers();

      expect(mockClient.get).toHaveBeenCalledWith('/users');
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('alice');
    });
  });
});
