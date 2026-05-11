import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskStatus, CreateTaskPayload } from '../types';
import { fetchTasks, updateTaskStatus, deleteTask, createTask } from '../api';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { useAuth } from '../context/AuthContext';
import './KanbanBoard.css';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export function KanbanBoard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalInitialStatus, setModalInitialStatus] = useState<TaskStatus>('TODO');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las tareas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleMove = useCallback(async (id: number, newStatus: TaskStatus) => {
    // Actualizar optimisticamente
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    try {
      await updateTaskStatus(id, newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al mover la tarea.');
      // Revertir en caso de error
      loadTasks();
    }
  }, [loadTasks]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la tarea.');
      loadTasks();
    }
  }, [loadTasks]);

  const handleAddTask = useCallback((status: TaskStatus) => {
    setModalInitialStatus(status);
    setShowModal(true);
  }, []);

  const handleCreateTask = useCallback(async (payload: CreateTaskPayload) => {
    const newTask = await createTask(payload);
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const tasksByStatus = STATUSES.reduce<Record<TaskStatus, Task[]>>(
    (acc, s) => ({ ...acc, [s]: tasks.filter((t) => t.status === s) }),
    { TODO: [], IN_PROGRESS: [], DONE: [] }
  );

  return (
    <div className="board-container">
      <header className="board-header">
        <div className="board-header__content">
          <h1 className="board-header__title">
            <span className="board-header__logo" aria-hidden="true">&#9698;</span>
            Mini Jira
          </h1>
          <p className="board-header__sub">Tablero Kanban</p>
        </div>
        <div className="board-header__actions">
          <button
            className="btn btn--primary"
            onClick={() => handleAddTask('TODO')}
          >
            + Nueva tarea
          </button>
          <button
            className="btn btn--secondary board-header__refresh"
            onClick={loadTasks}
            aria-label="Recargar tablero"
            title="Recargar"
          >
            &#8635;
          </button>
          {user && (
            <div className="board-header__user">
              <span className="board-header__username">{user.username}</span>
              <button
                className="btn btn--ghost board-header__logout"
                onClick={logout}
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="board-error" role="alert">
          <strong>Error:</strong> {error}
          <button className="board-error__dismiss" onClick={() => setError(null)} aria-label="Cerrar error">
            &#10005;
          </button>
        </div>
      )}

      {loading ? (
        <div className="board-loading" aria-live="polite">
          <div className="board-loading__spinner" aria-hidden="true" />
          Cargando tareas...
        </div>
      ) : (
        <main className="board-columns" aria-label="Tablero Kanban">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onMove={handleMove}
              onDelete={handleDelete}
              onAddTask={() => handleAddTask(status)}
            />
          ))}
        </main>
      )}

      {showModal && (
        <TaskModal
          initialStatus={modalInitialStatus}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
}
