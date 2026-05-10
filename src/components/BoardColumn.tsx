import React from 'react';
import type { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface BoardColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
}

const COLUMN_COLORS: Record<TaskStatus, string> = {
  TODO: '#6b778c',
  IN_PROGRESS: '#0052cc',
  DONE: '#00875a',
};

const COLUMN_BG: Record<TaskStatus, string> = {
  TODO: '#f4f5f7',
  IN_PROGRESS: '#deebff',
  DONE: '#e3fcef',
};

const BoardColumn: React.FC<BoardColumnProps> = ({
  title,
  status,
  tasks,
  onStatusChange,
  onDelete,
}) => {
  const headerColor = COLUMN_COLORS[status];
  const bgColor = COLUMN_BG[status];

  const columnStyle: React.CSSProperties = {
    flex: '1 1 0',
    minWidth: '260px',
    maxWidth: '360px',
    backgroundColor: bgColor,
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: headerColor,
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const countBadgeStyle: React.CSSProperties = {
    backgroundColor: headerColor,
    color: '#ffffff',
    borderRadius: '12px',
    padding: '1px 8px',
    fontSize: '12px',
    fontWeight: 600,
  };

  const emptyStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#97a0af',
    fontSize: '13px',
    padding: '24px 0',
    fontStyle: 'italic',
  };

  return (
    <div style={columnStyle}>
      <div style={headerStyle}>
        <span>{title}</span>
        <span style={countBadgeStyle}>{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div style={emptyStyle}>Sin tareas</div>
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
  );
};

export default BoardColumn;
