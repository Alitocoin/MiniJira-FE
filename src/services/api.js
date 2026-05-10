import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tasks
export const getTasks = () => client.get('/api/tasks').then((r) => r.data);

export const createTask = (payload) =>
  client.post('/api/tasks', payload).then((r) => r.data);

export const updateTaskStatus = (id, status) =>
  client.patch(`/api/tasks/${id}/status`, { status }).then((r) => r.data);

export const deleteTask = (id) =>
  client.delete(`/api/tasks/${id}`).then((r) => r.data);

// Users
export const getUsers = () => client.get('/api/users').then((r) => r.data);

// Projects
export const getProjects = () =>
  client.get('/api/projects').then((r) => r.data);
