import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../components/ProgressBar';
import { axe } from 'jest-axe';

it('shows the initial percentage and follows the supplied progress value', async () => {
  const { container, rerender } = render(<ProgressBar />);
  expect(screen.getByText('0%')).toBeVisible();
  rerender(<ProgressBar value={75} />);
  expect(screen.getByText('75%')).toBeVisible();
  expect(screen.queryByText('0%')).not.toBeInTheDocument();
  expect((await axe(container)).violations).toEqual([]);
});

it('announces the supplied completion value to assistive technology', () => {
  render(<ProgressBar value={75} />);
  expect(screen.getByRole('progressbar', { name: 'Progression' })).toHaveAttribute('aria-valuenow', '75');
});
