import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoardColumn from '../components/BoardColumn';
import type { Task } from '../types';

const makeTask = (id: number, title: string): Task => ({
  id,
  title,
  description: 'Descripción de la tarea',
  status: 'TODO',
  storyPoints: 3,
  estimatedHours: 4,
  startDate: '2026-01-01',
  endDate: '2026-01-15',
  assignee: null,
  project: null,
  createdAt: '2026-01-01T00:00:00',
});

describe('BoardColumn', () => {
  const noop = vi.fn();

  // ------------------------------------------------------------------ //
  // Renderizado del título
  // ------------------------------------------------------------------ //

  it('renderiza el título de la columna', () => {
    render(
      <BoardColumn
        title="Por Hacer"
        status="TODO"
        tasks={[]}
        onStatusChange={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText('Por Hacer')).toBeInTheDocument();
  });

  it('renderiza el badge con el conteo correcto de tareas', () => {
    const tasks = [makeTask(1, 'Tarea A'), makeTask(2, 'Tarea B')];
    render(
      <BoardColumn
        title="TODO"
        status="TODO"
        tasks={tasks}
        onStatusChange={noop}
        onDelete={noop}
      />
    );
    // El badge muestra el número de tareas
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  // ------------------------------------------------------------------ //
  // Renderizado de tareas
  // ------------------------------------------------------------------ //

  it('renderiza las tareas pasadas como prop', () => {
    const tasks = [
      makeTask(1, 'Implementar login'),
      makeTask(2, 'Crear endpoints'),
    ];
    render(
      <BoardColumn
        title="TODO"
        status="TODO"
        tasks={tasks}
        onStatusChange={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText('Implementar login')).toBeInTheDocument();
    expect(screen.getByText('Crear endpoints')).toBeInTheDocument();
  });

  it('renderiza exactamente la misma cantidad de TaskCards que tareas recibidas', () => {
    const tasks = [makeTask(1, 'T1'), makeTask(2, 'T2'), makeTask(3, 'T3')];
    render(
      <BoardColumn
        title="TODO"
        status="TODO"
        tasks={tasks}
        onStatusChange={noop}
        onDelete={noop}
      />
    );
    // Cada TaskCard tiene un botón "Eliminar"
    const deleteButtons = screen.getAllByText('Eliminar');
    expect(deleteButtons).toHaveLength(3);
  });

  // ------------------------------------------------------------------ //
  // Estado vacío
  // ------------------------------------------------------------------ //

  it('muestra mensaje "Sin tareas" cuando no hay tareas', () => {
    render(
      <BoardColumn
        title="DONE"
        status="DONE"
        tasks={[]}
        onStatusChange={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText('Sin tareas')).toBeInTheDocument();
  });

  it('no muestra el mensaje vacío cuando hay tareas', () => {
    render(
      <BoardColumn
        title="TODO"
        status="TODO"
        tasks={[makeTask(1, 'Tarea existente')]}
        onStatusChange={noop}
        onDelete={noop}
      />
    );
    expect(screen.queryByText('Sin tareas')).not.toBeInTheDocument();
  });

  // ------------------------------------------------------------------ //
  // Callbacks de interacción
  // ------------------------------------------------------------------ //

  it('llama a onDelete con el id correcto al hacer click en Eliminar', async () => {
    const onDelete = vi.fn();
    const task = makeTask(42, 'Tarea para borrar');
    render(
      <BoardColumn
        title="TODO"
        status="TODO"
        tasks={[task]}
        onStatusChange={noop}
        onDelete={onDelete}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByText('Eliminar'));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(42);
  });

  it('llama a onStatusChange con el id y status correcto al avanzar tarea', async () => {
    const onStatusChange = vi.fn();
    // Tarea en TODO => tiene botón → para pasar a IN_PROGRESS
    const task = makeTask(7, 'Tarea avanzar');
    render(
      <BoardColumn
        title="TODO"
        status="TODO"
        tasks={[task]}
        onStatusChange={onStatusChange}
        onDelete={noop}
      />
    );
    const user = userEvent.setup();
    // El botón → mueve al siguiente status
    const nextButton = screen.getByTitle('Mover a IN_PROGRESS');
    await user.click(nextButton);
    expect(onStatusChange).toHaveBeenCalledWith(7, 'IN_PROGRESS');
  });

  // ------------------------------------------------------------------ //
  // Distintos status de columna
  // ------------------------------------------------------------------ //

  it('renderiza columna IN_PROGRESS sin errores', () => {
    const task = { ...makeTask(1, 'En progreso'), status: 'IN_PROGRESS' as const };
    render(
      <BoardColumn
        title="En Progreso"
        status="IN_PROGRESS"
        tasks={[task]}
        onStatusChange={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText('En Progreso')).toBeInTheDocument();
    expect(screen.getByText('En progreso')).toBeInTheDocument();
  });

  it('renderiza columna DONE sin errores y con badge correcto', () => {
    const task = { ...makeTask(1, 'Finalizada'), status: 'DONE' as const };
    render(
      <BoardColumn
        title="Hecho"
        status="DONE"
        tasks={[task]}
        onStatusChange={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText('Hecho')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
