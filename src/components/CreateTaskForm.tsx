import React, { useState, useEffect } from 'react';
import type { Task, TaskRequest, TaskStatus, User } from '../types';
import { createTask, getUsers } from '../api';

interface CreateTaskFormProps {
  onCreated: (task: Task) => void;
  onClose: () => void;
  defaultStatus?: TaskStatus;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(9, 30, 66, 0.54)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '28px 32px',
  width: '100%',
  maxWidth: '480px',
  boxShadow: '0 8px 32px rgba(9,30,66,0.25)',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#172b4d',
  marginBottom: '20px',
};

const fieldStyle: React.CSSProperties = {
  marginBottom: '14px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#5e6c84',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #dfe1e6',
  borderRadius: '4px',
  fontSize: '14px',
  color: '#172b4d',
  outline: 'none',
  transition: 'border-color 0.15s',
  backgroundColor: '#ffffff',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '20px',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '8px 18px',
  backgroundColor: '#0052cc',
  color: '#ffffff',
  border: 'none',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '8px 18px',
  backgroundColor: 'transparent',
  color: '#5e6c84',
  border: '1px solid #dfe1e6',
  borderRadius: '4px',
  fontSize: '14px',
  cursor: 'pointer',
};

const errorStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#de350b',
  marginTop: '4px',
};

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'Por hacer' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'DONE', label: 'Hecho' },
];

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onCreated, onClose, defaultStatus = 'TODO' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [storyPoints, setStoryPoints] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => {
        // Si no hay usuarios disponibles, simplemente no mostramos el selector
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El titulo es requerido.');
      return;
    }

    const payload: TaskRequest = {
      title: title.trim(),
      description: description.trim(),
      status,
    };

    if (storyPoints !== '') payload.storyPoints = Number(storyPoints);
    if (estimatedHours !== '') payload.estimatedHours = Number(estimatedHours);
    if (assigneeId !== '') payload.assigneeId = Number(assigneeId);

    setSubmitting(true);
    setError(null);

    try {
      const created = await createTask(payload);
      onCreated(created);
      onClose();
    } catch {
      setError('Error al crear la tarea. Verifica que el backend este activo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        <div style={modalTitleStyle}>Nueva tarea</div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="task-title">
              Titulo <span style={{ color: '#de350b' }}>*</span>
            </label>
            <input
              id="task-title"
              style={inputStyle}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la tarea"
              autoFocus
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="task-desc">
              Descripcion
            </label>
            <textarea
              id="task-desc"
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripcion opcional"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="task-status">
              Estado inicial
            </label>
            <select
              id="task-status"
              style={inputStyle}
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {users.length > 0 && (
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="task-assignee">
                Asignar a
              </label>
              <select
                id="task-assignee"
                style={inputStyle}
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Sin asignar</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ ...rowStyle, ...fieldStyle }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="task-sp">
                Story Points
              </label>
              <input
                id="task-sp"
                style={inputStyle}
                type="number"
                min="0"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                placeholder="0"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="task-hours">
                Horas estimadas
              </label>
              <input
                id="task-hours"
                style={inputStyle}
                type="number"
                min="0"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <div style={actionsStyle}>
            <button type="button" style={cancelBtnStyle} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" style={primaryBtnStyle} disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskForm;
