import React, { useEffect, useState } from 'react';
import type { Task, TaskStatus, AuthSession } from './types';
import { getTasks, updateTaskStatus, deleteTask } from './api';
import BoardColumn from './components/BoardColumn';
import CreateTaskForm from './components/CreateTaskForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

type AuthView = 'login' | 'register';

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

const headerActionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const userBadgeStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(255,255,255,0.85)',
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

const logoutBtnStyle: React.CSSProperties = {
  padding: '7px 14px',
  backgroundColor: 'transparent',
  color: 'rgba(255,255,255,0.85)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: '4px',
  fontSize: '13px',
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

const getStoredSession = (): AuthSession | null => {
  const token = localStorage.getItem('auth_token');
  const username = localStorage.getItem('auth_username');
  const email = localStorage.getItem('auth_email');
  if (token && username && email) return { token, username, email };
  return null;
};

const clearSession = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_username');
  localStorage.removeItem('auth_email');
};

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const stored = getStoredSession();
    if (stored) setSession(stored);
  }, []);

  useEffect(() => {
    if (session) fetchTasks();
  }, [session]);

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

  const handleAuthenticated = (newSession: AuthSession) => setSession(newSession);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setTasks([]);
    setError(null);
    setAuthView('login');
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

  const handleCreated = (task: Task) => setTasks((prev) => [...prev, task]);

  const tasksByStatus = (status: TaskStatus): Task[] =>
    tasks.filter((t) => t.status === status);

  if (!session) {
    if (authView === 'register') {
      return <RegisterForm onAuthenticated={handleAuthenticated} onGoToLogin={() => setAuthView('login')} />;
    }
    return <LoginForm onAuthenticated={handleAuthenticated} onGoToRegister={() => setAuthView('register')} />;
  }

  return (
    <>
      <header style={headerStyle}>
        <span style={logoStyle}>Mini Jira</span>
        <div style={headerActionsStyle}>
          <span style={userBadgeStyle}>{session.username}</span>
          <button style={newTaskBtnStyle} onClick={() => setShowForm(true)}>+ Nueva tarea</button>
          <button style={logoutBtnStyle} onClick={handleLogout}>Cerrar sesion</button>
        </div>
      </header>

      {error && (
        <div style={errorBannerStyle}>
          {error}{' '}
          <button onClick={fetchTasks} style={{ marginLeft: '8px', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', color: '#de350b', fontSize: '13px' }}>
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

      {showForm && <CreateTaskForm onCreated={handleCreated} onClose={() => setShowForm(false)} />}
    </>
  );
};

export default App;
