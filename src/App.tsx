import React, { useEffect, useState } from 'react';
import type { Task, TaskStatus } from './types';
import { getTasks, updateTaskStatus, deleteTask } from './api';
import BoardColumn from './components/BoardColumn';
import CreateTaskForm from './components/CreateTaskForm';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'TODO', title: 'Por hacer' },
  { status: 'IN_PROGRESS', title: 'En progreso' },
  { status: 'DONE', title: 'Hecho' },
];

const headerStyle: React.CSSProperties = {
  backgroundColor: '#0052cc',
  color: '#ffffff',
  padding: '14px 28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
};

const logoStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  letterSpacing: '0.02em',
};

const newTaskBtnStyle: React.CSSProperties = {
  padding: '7px 16px',
  backgroundColor: '#ffffff',
  color: '#0052cc',
  border: 'none',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
};

const boardWrapStyle: React.CSSProperties = {
  padding: '24px 28px',
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
  overflowX: 'auto',
  minHeight: 'calc(100vh - 56px)',
};

const errorBannerStyle: React.CSSProperties = {
  margin: '20px 28px',
  padding: '12px 16px',
  backgroundColor: '#ffebe6',
  border: '1px solid #ff5630',
  borderRadius: '4px',
  color: '#de350b',
  fontSize: '13px',
};

const loadingStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '60px',
  color: '#6b778c',
  fontSize: '15px',
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch {
      setError('No se pudieron cargar las tareas. Verifica que el backend este corriendo en localhost:8080.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: TaskStatus) => {
    setError(null);
    try {
      const updated = await updateTaskStatus(id, status);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError('Error al actualizar el estado de la tarea.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Eliminar esta tarea?')) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Error al eliminar la tarea.');
    }
  };

  const handleCreated = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  const tasksByStatus = (status: TaskStatus): Task[] =>
    tasks.filter((t) => t.status === status);

  return (
    <>
      <header style={headerStyle}>
        <span style={logoStyle}>Mini Jira</span>
        <button style={newTaskBtnStyle} onClick={() => setShowForm(true)}>
          + Nueva tarea
        </button>
      </header>

      {error && (
        <div style={errorBannerStyle}>
          {error}{' '}
          <button
            onClick={fetchTasks}
            style={{ marginLeft: '8px', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', color: '#de350b', fontSize: '13px' }}
          >
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div style={loadingStyle}>Cargando tablero...</div>
      ) : (
        <main style={boardWrapStyle}>
          {COLUMNS.map(({ status, title }) => (
            <BoardColumn
              key={status}
              title={title}
              status={status}
              tasks={tasksByStatus(status)}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </main>
      )}

      {showForm && (
        <CreateTaskForm
          onCreated={handleCreated}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
};

export default App;
