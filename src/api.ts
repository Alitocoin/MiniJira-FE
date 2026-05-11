import axios from 'axios';
import type { Task, TaskRequest, TaskStatus, User, Project } from './types';

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

export const getTask = (id: number): Promise<Task> =>
  client.get<Task>(`/tasks/${id}`).then((res) => res.data);

export const createTask = (data: TaskRequest): Promise<Task> =>
  client.post<Task>('/tasks', data).then((res) => res.data);

export const updateTask = (id: number, data: TaskRequest): Promise<Task> =>
  client.put<Task>(`/tasks/${id}`, data).then((res) => res.data);

export const updateTaskStatus = (id: number, status: TaskStatus): Promise<Task> =>
  client.patch<Task>(`/tasks/${id}/status`, { status }).then((res) => res.data);

export const deleteTask = (id: number): Promise<void> =>
  client.delete(`/tasks/${id}`).then(() => undefined);

// Users
export const getUsers = (): Promise<User[]> =>
  client.get<User[]>('/users').then((res) => res.data);

export const createUser = (data: { username: string; email: string }): Promise<User> =>
  client.post<User>('/users', data).then((res) => res.data);

// Projects
export const getProjects = (): Promise<Project[]> =>
  client.get<Project[]>('/projects').then((res) => res.data);

export const createProject = (data: { name: string; description: string }): Promise<Project> =>
  client.post<Project>('/projects', data).then((res) => res.data);
