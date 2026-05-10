export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  storyPoints: number | null;
  estimatedHours: number | null;
  startDate: string | null;
  endDate: string | null;
  assignee: User | null;
  project: Project | null;
  createdAt: string;
}

export interface TaskRequest {
  title: string;
  description: string;
  status: TaskStatus;
  storyPoints?: number;
  estimatedHours?: number;
  startDate?: string;
  endDate?: string;
  assigneeId?: number;
  projectId?: number;
}
