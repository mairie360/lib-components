import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { sizes } from '../../kit/theme';
import { PriorityPill, StatusBadge, StatusPill, statuses } from './StatusPill';

describe('StatusPill (MAIR-608)', () => {
  it('renders every tone and size and maps business statuses and priorities to one colour', async () => {
    const { container } = render(<>
      {sizes.map(size => <StatusPill key={size} label={size} size={size} tone="info" dot />)}
      <StatusBadge status="active" /><StatusBadge status="late" label="3 en retard" /><PriorityPill level="high" />
    </>);
    expect(container.querySelectorAll('[data-size]')).toHaveLength(8);
    expect(screen.getByText('Actif')).toHaveAttribute('data-tone', 'success'); expect(screen.getByText('Actif')).toHaveAttribute('data-status', 'active');
    expect(screen.getByText('3 en retard')).toHaveAttribute('data-tone', 'danger');
    expect(screen.getByText('Haute')).toHaveAttribute('data-priority', 'high');
    expect(Object.keys(statuses)).toContain('revoked');
    expect((await axe(container)).violations).toEqual([]);
  });
});
