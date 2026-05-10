import TaskCard from '../TaskCard/TaskCard.jsx';
import styles from './KanbanColumn.module.css';

export default function KanbanColumn({ column, tasks, onStatusChange, onDelete }) {
  return (
    <section className={styles.column} aria-label={column.label}>
      <div className={`${styles.colHeader} ${styles[column.colorClass]}`}>
        <span className={styles.colLabel}>{column.label}</span>
        <span className={styles.colCount} aria-label={`${tasks.length} tareas`}>
          {tasks.length}
        </span>
      </div>
      <div className={styles.colBody}>
        {tasks.length === 0 ? (
          <div className={styles.emptyCol} aria-label="Columna vacía">
            Sin tareas
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
