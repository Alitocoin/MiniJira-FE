import KanbanColumn from '../KanbanColumn/KanbanColumn.jsx';
import styles from './KanbanBoard.module.css';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', colorClass: 'colTodo' },
  { id: 'IN_PROGRESS', label: 'En progreso', colorClass: 'colInProgress' },
  { id: 'DONE', label: 'Hecho', colorClass: 'colDone' },
];

export default function KanbanBoard({ tasks, onStatusChange, onDelete, loading }) {
  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} aria-label="Cargando tareas" />
        <p>Cargando tablero...</p>
      </div>
    );
  }

  return (
    <main className={styles.board} aria-label="Tablero Kanban">
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.id}
          column={col}
          tasks={tasksByStatus[col.id] || []}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </main>
  );
}
