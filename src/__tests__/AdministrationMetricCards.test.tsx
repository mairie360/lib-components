import React from 'react';
import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { AdministrationMetricCards } from '../components/AdministrationMetricCards';
import { axe } from 'jest-axe';

it('distinguishes an unavailable metric source from an available empty result', () => {
  const { rerender } = render(<AdministrationMetricCards />); expect(screen.getByText('Indicateurs indisponibles.')).toBeVisible();
  rerender(<AdministrationMetricCards stats={[]} />); expect(screen.getByText('Aucun indicateur à afficher.')).toBeVisible();
});
it('renders received metric labels, values and their indicator content', async () => {
  const { container } = render(<AdministrationMetricCards stats={[
    { id: 'a', label: 'Utilisateurs', value: 12, tone: 'blue', icon: Users, indicator: 'up' },
    { id: 'b', label: 'Sessions', value: 8, tone: 'green', icon: Users, indicator: 'down' },
    { id: 'c', label: 'Alertes', value: 1, tone: 'yellow', icon: Users, indicator: 'À vérifier' },
    { id: 'd', label: 'Erreurs', value: 0, tone: 'red', icon: Users },
  ]} />);
  expect(screen.getAllByRole('article')).toHaveLength(4); expect(screen.getByText('12')).toBeVisible(); expect(screen.getByText('À vérifier')).toBeVisible(); expect(screen.getByText('Erreurs')).toBeVisible(); expect((await axe(container)).violations).toEqual([]);
});
