import type { Task, TaskStatus } from '../types';
import './TaskCard.css';

const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

interface Props {
  task: Task;
  onMove: (id: number, newStatus: TaskStatus) => void;
  onDelete: (id: number) => void;
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En progreso',
  DONE: 'Terminada',
};

export function TaskCard({ task, onMove, onDelete }: Props) {
  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const canMovePrev = currentIndex > 0;
  const canMoveNext = currentIndex < STATUS_ORDER.length - 1;

  const handlePrev = () => {
    if (canMovePrev) onMove(task.id, STATUS_ORDER[currentIndex - 1]);
  };

  const handleNext = () => {
    if (canMoveNext) onMove(task.id, STATUS_ORDER[currentIndex + 1]);
  };

  const truncate = (text: string, max = 80) =>
    text && text.length > max ? text.slice(0, max) + '...' : text;

  return (
    <article className="task-card" aria-label={`Tarea: ${task.title}`}>
      <header className="task-card__header">
        <span className={`task-card__badge task-card__badge--${task.status.toLowerCase().replace('_', '-')}`}>
          {STATUS_LABEL[task.status]}
        </span>
        <span className="task-card__points" title="Story points">
          SP {task.storyPoints ?? '—'}
        </span>
      </header>

      <h3 className="task-card__title">{task.title}</h3>

      {task.description && (
        <p className="task-card__desc">{truncate(task.description)}</p>
      )}

      <footer className="task-card__footer">
        <div className="task-card__meta">
          {task.assignedUserName && (
            <span className="task-card__user">
              <span className="task-card__avatar" aria-hidden="true">
                {task.assignedUserName.charAt(0).toUpperCase()}
              </span>
              {task.assignedUserName}
            </span>
          )}
          {task.projectName && (
            <span className="task-card__project">{task.projectName}</span>
          )}
        </div>

        <div className="task-card__actions">
          <button
            className="task-card__btn task-card__btn--move"
            onClick={handlePrev}
            disabled={!canMovePrev}
            aria-label="Mover al estado anterior"
            title="Mover atras"
          >
            &#8592;
          </button>
          <button
            className="task-card__btn task-card__btn--move"
            onClick={handleNext}
            disabled={!canMoveNext}
            aria-label="Mover al estado siguiente"
            title="Mover adelante"
          >
            &#8594;
          </button>
          <button
            className="task-card__btn task-card__btn--delete"
            onClick={() => onDelete(task.id)}
            aria-label="Eliminar tarea"
            title="Eliminar"
          >
            &#10005;
          </button>
        </div>
      </footer>
    </article>
  );
}
