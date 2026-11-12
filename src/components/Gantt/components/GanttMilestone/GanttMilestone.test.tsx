import { render, screen } from '@testing-library/react';
import { GanttMilestone } from './GanttMilestone';

it('is a focusable diamond with its tooltip text (MAIR-891)', () => {
  render(<GanttMilestone label="Mise en service" date="2026-12-15" />);
  const milestone = screen.getByRole('img', { name: 'Mise en service, 15 déc. 2026, à venir' });
  expect(milestone).toHaveAttribute('tabindex', '0');
  expect(milestone).toHaveAttribute('data-reached', 'false');
  expect(milestone).toHaveTextContent('Mise en service · 15 déc. 2026');
});
