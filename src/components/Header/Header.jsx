import styles from './Header.module.css';

export default function Header({ onNewTask }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>MJ</span>
          <span className={styles.title}>Mini Jira</span>
        </div>
        <button className={styles.newTaskBtn} onClick={onNewTask}>
          + Nueva tarea
        </button>
      </div>
    </header>
  );
}
