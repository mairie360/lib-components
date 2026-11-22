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

  it('aligns review, paused and late on the Figma Status/* tones (MAIR-898)', () => {
    render(<><StatusBadge status="review" /><StatusBadge status="paused" /><StatusBadge status="late" /></>);
    expect(screen.getByText('En revue')).toHaveAttribute('data-tone', 'secondary');
    expect(screen.getByText('Suspendu')).toHaveAttribute('data-tone', 'warning');
    expect(screen.getByText('En retard')).toHaveAttribute('data-tone', 'danger');
  });

  it('MAIR-1124 offers the purple and strong secondary tones', async () => {
    const { container } = render(<><StatusPill label="Autre" tone="purple" /><StatusPill label="Réunion" tone="secondary-strong" dot /></>);
    expect(screen.getByText('Autre')).toHaveAttribute('data-tone', 'purple');
    expect(screen.getByText('Autre').style.color).toBe('var(--mairie-purple-text)');
    expect(screen.getByText('Réunion').style.background).toBe('var(--mairie-secondary-action-background)');
    expect(screen.getByText('Réunion').style.color).toBe('var(--mairie-on-secondary)');
    expect((await axe(container)).violations).toEqual([]);
  });
});
