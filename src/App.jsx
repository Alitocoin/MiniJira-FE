import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header/Header.jsx';
import KanbanBoard from './components/KanbanBoard/KanbanBoard.jsx';
import CreateTaskModal from './components/CreateTaskModal/CreateTaskModal.jsx';
import { getTasks, createTask, updateTaskStatus, deleteTask } from './services/api.js';
import styles from './App.module.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando tareas:', err);
      setError('No se pudieron cargar las tareas. Verifica que el backend esté corriendo en ' +
        (import.meta.env.VITE_API_URL || 'http://localhost:8080'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (payload) => {
    const newTask = await createTask(payload);
    setTasks((prev) => [...prev, newTask]);
  };

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    try {
      const updated = await updateTaskStatus(id, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
      );
    } catch (err) {
      console.error('Error actualizando status:', err);
      // Revert on error
      fetchTasks();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta tarea?')) return;
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (err) {
      console.error('Error eliminando tarea:', err);
      // Revert on error
      fetchTasks();
    }
  };

  return (
    <div className={styles.app}>
      <Header onNewTask={() => setShowModal(true)} />

      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button onClick={fetchTasks} className={styles.retryBtn}>Reintentar</button>
        </div>
      )}

      <KanbanBoard
        tasks={tasks}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        loading={loading}
      />

      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreateTask}
        />
      )}
    </div>
  );
}
