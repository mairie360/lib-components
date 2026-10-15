import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../components/Badge';
import { axe } from 'jest-axe';

it('keeps its status text accessible across visual variants', async () => {
  const { container, rerender } = render(<Badge text="Validé" />);
  expect(screen.getByText('Validé')).toBeVisible();
  rerender(<Badge text="En attente" variant="blue" rounded />);
  expect(screen.queryByText('Validé')).not.toBeInTheDocument();
  expect(screen.getByText('En attente')).toBeVisible();
  expect((await axe(container)).violations).toEqual([]);
});
