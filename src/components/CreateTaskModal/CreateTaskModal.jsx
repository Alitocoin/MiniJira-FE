import { useState, useEffect } from 'react';
import { getUsers, getProjects } from '../../services/api.js';
import styles from './CreateTaskModal.module.css';

const INITIAL_FORM = {
  title: '',
  description: '',
  storyPoints: '',
  estimatedHours: '',
  startDate: '',
  endDate: '',
  assignedUserId: '',
  projectId: '',
  status: 'TODO',
};

export default function CreateTaskModal({ onClose, onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getUsers(), getProjects()])
      .then(([usersData, projectsData]) => {
        setUsers(Array.isArray(usersData) ? usersData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      })
      .catch(() => {
        // No bloquea el formulario si falla la carga de selects
      });
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLoading(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      storyPoints: form.storyPoints !== '' ? Number(form.storyPoints) : null,
      estimatedHours: form.estimatedHours !== '' ? Number(form.estimatedHours) : null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      status: 'TODO',
    };

    if (form.assignedUserId) {
      payload.assignedUserId = Number(form.assignedUserId);
    }
    if (form.projectId) {
      payload.projectId = Number(form.projectId);
    }

    try {
      await onCreated(payload);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al crear la tarea. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>Nueva tarea</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">&times;</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <div className={styles.errorBanner} role="alert">{error}</div>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">
              Titulo <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={styles.input}
              value={form.title}
              onChange={handleChange}
              placeholder="Nombre de la tarea"
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">Descripcion</label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              value={form.description}
              onChange={handleChange}
              placeholder="Descripcion opcional..."
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="storyPoints">Story Points</label>
              <input
                id="storyPoints"
                name="storyPoints"
                type="number"
                className={styles.input}
                value={form.storyPoints}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="estimatedHours">Horas estimadas</label>
              <input
                id="estimatedHours"
                name="estimatedHours"
                type="number"
                className={styles.input}
                value={form.estimatedHours}
                onChange={handleChange}
                min="0"
                step="0.5"
                placeholder="0"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="startDate">Fecha inicio</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                className={styles.input}
                value={form.startDate}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="endDate">Fecha fin</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                className={styles.input}
                value={form.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="assignedUserId">Asignar a</label>
            <select
              id="assignedUserId"
              name="assignedUserId"
              className={styles.select}
              value={form.assignedUserId}
              onChange={handleChange}
            >
              <option value="">-- Sin asignar --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.username || u.email || `Usuario ${u.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="projectId">Proyecto</label>
            <select
              id="projectId"
              name="projectId"
              className={styles.select}
              value={form.projectId}
              onChange={handleChange}
            >
              <option value="">-- Sin proyecto --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.title || `Proyecto ${p.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading || !form.title.trim()}>
              {loading ? 'Creando...' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
