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

/**
 * Refleja el contrato real de TaskResponse del backend:
 * - assignedUser y project se devuelven como campos planos (no objetos anidados)
 * - storyPoints y estimatedHours son nullables (Integer/Double en Java)
 */
export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  storyPoints: number | null;
  estimatedHours: number | null;
  startDate: string | null;
  endDate: string | null;
  assignedUserId: number | null;
  assignedUserName: string | null;
  projectId: number | null;
  projectName: string | null;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
  storyPoints: number;
  estimatedHours: number;
  startDate: string;
  endDate: string;
  assignedUserId: number | null;
  projectId: number | null;
}
