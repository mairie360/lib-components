import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Gantt } from './Gantt';
import { formatGanttDate, ganttMonths, ganttPercent, ganttTime } from './gantt-dates';

const rows = [
  { id: 'cadrage', label: 'Cadrage', state: 'done' as const, start: '2026-09-01', end: '2026-09-30', assigneeInitials: 'MM' },
  { id: 'dev', label: 'Développement', state: 'doing' as const, start: '2026-10-15', end: '2026-12-10', assigneeInitials: 'QT' },
  { id: 'formation', label: 'Formation des agents', state: 'late' as const, start: '2026-10-01', end: '2026-11-01' },
];
const milestones = [{ id: 'm1', label: 'Validation des maquettes', date: '2026-09-25', reached: true }, { id: 'm2', label: 'Mise en service', date: '2026-12-15' }];

describe('Gantt (MAIR-891)', () => {
  it('draws months, milestones, one named bar per task and the legend', async () => {
    const { container } = render(<Gantt label="Planning du projet" from="2026-09-01" to="2027-01-01" rows={rows} milestones={milestones} today="2026-11-12" />);
    const planning = screen.getByRole('region', { name: 'Planning du projet' });
    expect(planning).toHaveTextContent('sept.');
    expect(planning).toHaveTextContent('déc.');
    const tasks = within(screen.getByRole('list', { name: 'Tâches' })).getAllByRole('listitem');
    expect(tasks).toHaveLength(3);
    const bar = screen.getByRole('img', { name: 'Développement, en cours, du 15 oct. 2026 au 10 déc. 2026' });
    expect(bar).toHaveAttribute('tabindex', '0');
    expect(bar).toHaveAttribute('data-state', 'doing');
    expect(bar.style.left).toMatch(/^36\.\d+%$/);
    expect(bar).toHaveTextContent('QT');
    expect(screen.getByRole('img', { name: 'Validation des maquettes, 25 sept. 2026, atteint' })).toHaveAttribute('data-reached', 'true');
    expect(screen.getByRole('img', { name: 'Mise en service, 15 déc. 2026, à venir' })).toBeInTheDocument();
    expect(container.querySelector('[data-m360-component="GanttToday"]')).not.toBeNull();
    expect(within(screen.getByRole('list', { name: 'Légende' })).getAllByRole('listitem').map(item => item.textContent)).toEqual(['À faire', 'En cours', 'Terminé', 'En retard']);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('turns bars into buttons with onRowClick and hides today outside the period', () => {
    const onRowClick = jest.fn();
    const { container } = render(<Gantt from="2026-09-01" to="2027-01-01" rows={rows} onRowClick={onRowClick} today="2027-03-01" />);
    fireEvent.click(screen.getByRole('button', { name: /^Formation des agents, en retard/ }));
    expect(onRowClick).toHaveBeenCalledWith(rows[2]);
    expect(screen.queryByRole('list', { name: 'Jalons' })).not.toBeInTheDocument();
    expect(container.querySelector('[data-m360-component="GanttToday"]')).toBeNull();
    expect(screen.getByRole('region', { name: 'Planning' })).toBeInTheDocument();
  });
});

describe('planning dates', () => {
  it('reads calendar days at UTC midnight and clamps positions', () => {
    expect(ganttTime('2026-11-12')).toBe(Date.UTC(2026, 10, 12));
    expect(ganttTime(new Date(0))).toBe(0);
    expect(ganttPercent('2026-01-16', '2026-01-01', '2026-01-31')).toBe(50);
    expect(ganttPercent('2025-12-01', '2026-01-01', '2026-01-31')).toBe(0);
    expect(ganttPercent('2026-03-01', '2026-01-01', '2026-01-31')).toBe(100);
    expect(ganttPercent('2026-01-10', '2026-01-31', '2026-01-01')).toBe(0);
    expect(formatGanttDate('2026-11-12')).toBe('12 nov. 2026');
  });

  it('lists the overlapping months and names the year when it changes', () => {
    expect(ganttMonths('2026-11-15', '2027-02-01').map(month => month.label)).toEqual(['nov.', 'déc.', 'janv. 2027']);
  });
});
