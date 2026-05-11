import axios from 'axios';
import type { Task, TaskRequest, TaskStatus, User, AuthResponse } from './types';

const BASE_URL = 'http://localhost:8080/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: adjunta el token JWT a cada request si existe
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
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

// Auth
export const login = (email: string, password: string): Promise<AuthResponse> =>
  client.post<AuthResponse>('/auth/login', { email, password }).then((res) => res.data);

export const register = (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> =>
  client.post<AuthResponse>('/auth/register', { username, email, password }).then((res) => res.data);
