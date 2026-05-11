import { useState, useEffect, useRef } from 'react';
import type { TaskStatus, User, Project, CreateTaskPayload } from '../types';
import { fetchUsers, fetchProjects } from '../api';
import './TaskModal.css';

interface Props {
  initialStatus?: TaskStatus;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

export function TaskModal({ initialStatus = 'TODO', onClose, onSubmit }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [storyPoints, setStoryPoints] = useState<number | ''>('');
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState<number | ''>('');
  const [projectId, setProjectId] = useState<number | ''>('');

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchProjects()])
      .then(([u, p]) => {
        setUsers(u);
        setProjects(p);
      })
      .catch(() => {
        // usuarios y proyectos son opcionales — si falla, continua
      })
      .finally(() => setLoadingMeta(false));

    firstInputRef.current?.focus();
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El titulo es requerido.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const payload: CreateTaskPayload = {
      title: title.trim(),
      description: description.trim(),
      status,
      storyPoints: storyPoints === '' ? 0 : Number(storyPoints),
      estimatedHours: estimatedHours === '' ? 0 : Number(estimatedHours),
      startDate: startDate || today(),
      endDate: endDate || startDate || today(),
      userId: userId === '' ? null : Number(userId),
      projectId: projectId === '' ? null : Number(projectId),
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la tarea.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <header className="modal__header">
          <h2 id="modal-title" className="modal__title">Nueva tarea</h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            &#10005;
          </button>
        </header>

        {error && (
          <div className="modal__error" role="alert">
            {error}
          </div>
        )}

        <form className="modal__form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="task-title" className="form-label">
              Titulo <span aria-hidden="true" className="required">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="task-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la tarea"
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc" className="form-label">Descripcion</label>
            <textarea
              id="task-desc"
              className="form-input form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripcion de la tarea"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-status" className="form-label">Estado</label>
              <select
                id="task-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="TODO">Por hacer</option>
                <option value="IN_PROGRESS">En progreso</option>
                <option value="DONE">Terminada</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-sp" className="form-label">Story Points</label>
              <input
                id="task-sp"
                type="number"
                min="0"
                className="form-input"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-hours" className="form-label">Horas estimadas</label>
              <input
                id="task-hours"
                type="number"
                min="0"
                step="0.5"
                className="form-input"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-start" className="form-label">Fecha inicio</label>
              <input
                id="task-start"
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-end" className="form-label">Fecha fin</label>
              <input
                id="task-end"
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-user" className="form-label">
                Usuario asignado
                {loadingMeta && <span className="form-loading"> cargando...</span>}
              </label>
              <select
                id="task-user"
                className="form-input"
                value={userId}
                onChange={(e) => setUserId(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={loadingMeta}
              >
                <option value="">Sin asignar</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-project" className="form-label">
                Proyecto
              </label>
              <select
                id="task-project"
                className="form-input"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={loadingMeta}
              >
                <option value="">Sin proyecto</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <footer className="modal__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? 'Creando...' : 'Crear tarea'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
