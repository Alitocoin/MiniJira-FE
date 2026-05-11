import type { Task, CreateTaskPayload, TaskStatus, User, Project } from './types';
import axiosInstance from './api/axiosInstance';

export async function fetchTasks(): Promise<Task[]> {
  const { data } = await axiosInstance.get<Task[]>('/api/v1/tasks');
  return data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await axiosInstance.post<Task>('/api/v1/tasks', payload);
  return data;
}

export async function updateTask(id: number, payload: Partial<CreateTaskPayload>): Promise<Task> {
  const { data } = await axiosInstance.put<Task>(`/api/v1/tasks/${id}`, payload);
  return data;
}

export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  const { data } = await axiosInstance.patch<Task>(`/api/v1/tasks/${id}/status`, { status });
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await axiosInstance.delete(`/api/v1/tasks/${id}`);
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await axiosInstance.get<User[]>('/api/v1/users');
  return data;
}

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await axiosInstance.get<Project[]>('/api/v1/projects');
  return data;
}
