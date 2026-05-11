import type { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import './KanbanColumn.css';

const COLUMN_META: Record<TaskStatus, { label: string; colorClass: string }> = {
  TODO: { label: 'Por hacer', colorClass: 'col--todo' },
  IN_PROGRESS: { label: 'En progreso', colorClass: 'col--inprogress' },
  DONE: { label: 'Terminada', colorClass: 'col--done' },
};

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onMove: (id: number, newStatus: TaskStatus) => void;
  onDelete: (id: number) => void;
  onAddTask: () => void;
}

export function KanbanColumn({ status, tasks, onMove, onDelete, onAddTask }: Props) {
  const meta = COLUMN_META[status];

  return (
    <section className={`kanban-col ${meta.colorClass}`} aria-label={`Columna ${meta.label}`}>
      <header className="kanban-col__header">
        <div className="kanban-col__title-row">
          <h2 className="kanban-col__title">{meta.label}</h2>
          <span className="kanban-col__count" aria-label={`${tasks.length} tareas`}>
            {tasks.length}
          </span>
        </div>
        <button
          className="kanban-col__add-btn"
          onClick={onAddTask}
          aria-label={`Agregar tarea en ${meta.label}`}
          title="Nueva tarea"
        >
          + Nueva tarea
        </button>
      </header>

      <div className="kanban-col__cards" role="list">
        {tasks.length === 0 ? (
          <div className="kanban-col__empty" aria-live="polite">
            Sin tareas
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} role="listitem">
              <TaskCard task={task} onMove={onMove} onDelete={onDelete} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
