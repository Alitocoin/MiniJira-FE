import axios from 'axios';
import type { Task, TaskRequest, TaskStatus, User } from './types';

const BASE_URL = 'http://localhost:8080/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tasks
export const getTasks = (): Promise<Task[]> =>
  client.get<Task[]>('/tasks').then((res) => res.data);

export const createTask = (data: TaskRequest): Promise<Task> =>
  client.post<Task>('/tasks', data).then((res) => res.data);

export const updateTaskStatus = (id: number, status: TaskStatus): Promise<Task> =>
  client.patch<Task>(`/tasks/${id}/status`, { status }).then((res) => res.data);

export const deleteTask = (id: number): Promise<void> =>
  client.delete(`/tasks/${id}`).then(() => undefined);

// Users
export const getUsers = (): Promise<User[]> =>
  client.get<User[]>('/users').then((res) => res.data);

export const createUser = (data: { username: string; email: string }): Promise<User> =>
  client.post<User>('/users', data).then((res) => res.data);
