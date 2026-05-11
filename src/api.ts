import type { Task, CreateTaskPayload, TaskStatus, User, Project } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Error ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/api/v1/tasks`);
  return handleResponse<Task[]>(res);
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const res = await fetch(`${BASE_URL}/api/v1/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Task>(res);
}

export async function updateTask(id: number, payload: Partial<CreateTaskPayload>): Promise<Task> {
  const res = await fetch(`${BASE_URL}/api/v1/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Task>(res);
}

export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  const res = await fetch(`${BASE_URL}/api/v1/tasks/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Task>(res);
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/tasks/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(res);
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/api/v1/users`);
  return handleResponse<User[]>(res);
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${BASE_URL}/api/v1/projects`);
  return handleResponse<Project[]>(res);
}
