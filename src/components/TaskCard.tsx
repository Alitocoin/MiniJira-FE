import React from 'react';
import type { Task, TaskStatus } from '../types';

const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  padding: '12px 14px',
  marginBottom: '10px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  border: '1px solid #e1e4e8',
};

const titleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#172b4d',
  marginBottom: '4px',
  lineHeight: '1.4',
};

const descStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b778c',
  marginBottom: '8px',
  lineHeight: '1.5',
};

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginBottom: '10px',
};

const badgeStyle: React.CSSProperties = {
  fontSize: '11px',
  backgroundColor: '#ebecf0',
  color: '#5e6c84',
  borderRadius: '3px',
  padding: '2px 6px',
  fontWeight: 500,
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '6px',
};

const navBtnStyle: React.CSSProperties = {
  fontSize: '12px',
  padding: '3px 8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer',
  backgroundColor: '#f8f9fa',
  color: '#172b4d',
};

const deleteBtnStyle: React.CSSProperties = {
  fontSize: '11px',
  padding: '3px 8px',
  border: '1px solid #ff5630',
  borderRadius: '4px',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  color: '#ff5630',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete }) => {
  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const prevStatus = currentIndex > 0 ? STATUS_ORDER[currentIndex - 1] : null;
  const nextStatus = currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>{task.title}</div>

      {task.description && (
        <div style={descStyle}>{task.description}</div>
      )}

      <div style={metaRowStyle}>
        {task.storyPoints !== null && (
          <span style={badgeStyle}>SP: {task.storyPoints}</span>
        )}
        {task.estimatedHours !== null && (
          <span style={badgeStyle}>{task.estimatedHours}h</span>
        )}
        {task.assignee && (
          <span style={{ ...badgeStyle, backgroundColor: '#deebff', color: '#0052cc' }}>
            {task.assignee.username}
          </span>
        )}
      </div>

      <div style={actionsStyle}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {prevStatus && (
            <button
              style={navBtnStyle}
              onClick={() => onStatusChange(task.id, prevStatus)}
              title={`Mover a ${prevStatus}`}
            >
              &larr;
            </button>
          )}
          {nextStatus && (
            <button
              style={navBtnStyle}
              onClick={() => onStatusChange(task.id, nextStatus)}
              title={`Mover a ${nextStatus}`}
            >
              &rarr;
            </button>
          )}
        </div>
        <button
          style={deleteBtnStyle}
          onClick={() => onDelete(task.id)}
          title="Eliminar tarea"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
