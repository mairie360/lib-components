import { render, screen } from '@testing-library/react';
import { GanttBar } from './GanttBar';

it('colours the bar by state and names it by task, state and dates (MAIR-891)', () => {
  render(<><GanttBar state="late" start="2026-10-01" end="2026-11-01" label="Recette" /><GanttBar state="todo" start="2026-12-01" end="2026-12-20" label="Formation" assigneeInitials="HC" onClick={jest.fn()} /></>);
  const late = screen.getByRole('img', { name: 'Recette, en retard, du 1 oct. 2026 au 1 nov. 2026' });
  expect(late.style.background).toBe('var(--mairie-error-text)');
  expect(late).toHaveAttribute('data-m360-component', 'GanttBar');
  expect(screen.getByRole('button', { name: /^Formation, à faire/ })).toHaveTextContent('HC');
});
