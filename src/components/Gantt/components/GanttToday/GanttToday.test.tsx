import { render, screen } from '@testing-library/react';
import { GanttToday } from './GanttToday';

it('draws the decorative « aujourd’hui » marker (MAIR-891)', () => {
  const { container } = render(<GanttToday />);
  expect(screen.getByText('Aujourd’hui')).toBeInTheDocument();
  expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
});
