import styles from './TaskCard.module.css';

const STATUS_ORDER = ['TODO', 'IN_PROGRESS', 'DONE'];

const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'En progreso',
  DONE: 'Hecho',
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < STATUS_ORDER.length - 1;

  const prevStatus = hasPrev ? STATUS_ORDER[currentIndex - 1] : null;
  const nextStatus = hasNext ? STATUS_ORDER[currentIndex + 1] : null;

  const handleMove = (newStatus) => {
    onStatusChange(task.id, newStatus);
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{task.title}</h3>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(task.id)}
          title="Eliminar tarea"
          aria-label="Eliminar tarea"
        >
          &times;
        </button>
      </div>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      <div className={styles.meta}>
        {task.storyPoints != null && (
          <span className={styles.badge} title="Story Points">
            SP: {task.storyPoints}
          </span>
        )}
        {task.estimatedHours != null && (
          <span className={styles.badge} title="Horas estimadas">
            {task.estimatedHours}h
          </span>
        )}
        {task.assignedUser && (
          <span className={`${styles.badge} ${styles.userBadge}`} title="Asignado a">
            {task.assignedUser.name || task.assignedUser.username || task.assignedUser}
          </span>
        )}
      </div>

      {(task.startDate || task.endDate) && (
        <div className={styles.dates}>
          {task.startDate && (
            <span className={styles.date}>Inicio: {formatDate(task.startDate)}</span>
          )}
          {task.endDate && (
            <span className={styles.date}>Fin: {formatDate(task.endDate)}</span>
          )}
        </div>
      )}

      <div className={styles.actions}>
        {hasPrev && (
          <button
            className={`${styles.moveBtn} ${styles.movePrev}`}
            onClick={() => handleMove(prevStatus)}
            title={`Mover a ${STATUS_LABELS[prevStatus]}`}
          >
            &#8592; {STATUS_LABELS[prevStatus]}
          </button>
        )}
        <span className={styles.spacer} />
        {hasNext && (
          <button
            className={`${styles.moveBtn} ${styles.moveNext}`}
            onClick={() => handleMove(nextStatus)}
            title={`Mover a ${STATUS_LABELS[nextStatus]}`}
          >
            {STATUS_LABELS[nextStatus]} &#8594;
          </button>
        )}
      </div>
    </article>
  );
}
