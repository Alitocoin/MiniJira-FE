import React from 'react';
import type { Task, TaskStatus } from '../types';

const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En progreso',
  DONE: 'Hecho',
};

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
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
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
  marginTop: '8px',
  paddingTop: '8px',
  borderTop: '1px solid #f0f1f3',
};

const navBtnStyle: React.CSSProperties = {
  fontSize: '11px',
  padding: '3px 8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer',
  backgroundColor: '#f8f9fa',
  color: '#172b4d',
  whiteSpace: 'nowrap',
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

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  };

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>{task.title}</div>

      {task.description && (
        <div style={descStyle}>{task.description}</div>
      )}

      <div style={metaRowStyle}>
        {task.storyPoints !== null && (
          <span style={badgeStyle} title="Story Points">SP: {task.storyPoints}</span>
        )}
        {task.estimatedHours !== null && (
          <span style={badgeStyle} title="Horas estimadas">{task.estimatedHours}h</span>
        )}
        {task.endDate && (
          <span
            style={{ ...badgeStyle, backgroundColor: '#fffae6', color: '#974f0c' }}
            title="Fecha limite"
          >
            {formatDate(task.endDate)}
          </span>
        )}
        {task.assignee && (
          <span
            style={{ ...badgeStyle, backgroundColor: '#deebff', color: '#0052cc' }}
            title={`Asignado a: ${task.assignee.email}`}
          >
            {task.assignee.username}
          </span>
        )}
        {task.project && (
          <span
            style={{ ...badgeStyle, backgroundColor: '#e3fcef', color: '#006644' }}
            title="Proyecto"
          >
            {task.project.name}
          </span>
        )}
      </div>

      <div style={actionsStyle}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {prevStatus && (
            <button
              style={navBtnStyle}
              onClick={() => onStatusChange(task.id, prevStatus)}
              title={`Mover a: ${STATUS_LABELS[prevStatus]}`}
            >
              &larr; {STATUS_LABELS[prevStatus]}
            </button>
          )}
          {nextStatus && (
            <button
              style={navBtnStyle}
              onClick={() => onStatusChange(task.id, nextStatus)}
              title={`Mover a: ${STATUS_LABELS[nextStatus]}`}
            >
              {STATUS_LABELS[nextStatus]} &rarr;
            </button>
          )}
        </div>
        <button
          style={deleteBtnStyle}
          onClick={() => onDelete(task.id)}
          title="Eliminar tarea"
          aria-label={`Eliminar tarea: ${task.title}`}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
