export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  storyPoints: number;
  estimatedHours: number;
  startDate: string;
  endDate: string;
  assignedUser: User | null;
  project: Project | null;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
  storyPoints: number;
  estimatedHours: number;
  startDate: string;
  endDate: string;
  userId: number | null;
  projectId: number | null;
}
