import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { DashboardModule } from '../components/DashboardModule';

describe('DashboardModule', () => {
  it('renders the personalized overview and ATP sections', () => {
    render(<DashboardModule userFirstName="Alice" />);

    expect(screen.getByRole('heading', { name: 'Tableau de Bord' })).toBeInTheDocument();
    expect(screen.getByText('Bienvenue Alice, voici un aperçu de vos activités')).toBeInTheDocument();
    expect(screen.getByText('Projets actifs')).toBeInTheDocument();
    expect(screen.getByText('Citoyens servis')).toBeInTheDocument();
    expect(screen.getByText('Documents traités')).toBeInTheDocument();
    expect(screen.getByText('Événements ce mois')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Projets récents' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tâches en attente' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Actions rapides' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Événements à venir' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Aperçu des performances' })).toBeInTheDocument();
  });

  it('opens projects and tasks from their summaries', () => {
    const onProjectSelect = jest.fn();
    const onViewAllProjects = jest.fn();
    const onTaskSelect = jest.fn();
    const onViewAllTasks = jest.fn();
    render(<DashboardModule {...{ onProjectSelect, onViewAllProjects, onTaskSelect, onViewAllTasks }} />);

    fireEvent.click(screen.getByRole('button', { name: /Rénovation bibliothèque/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Voir tous' }));
    fireEvent.click(screen.getByRole('button', { name: /Validation budget formation/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Voir toutes' }));

    expect(onProjectSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'library' }));
    expect(onViewAllProjects).toHaveBeenCalledTimes(1);
    expect(onTaskSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'training-budget' }));
    expect(onViewAllTasks).toHaveBeenCalledTimes(1);
  });

  it('dispatches all authorized quick actions', () => {
    const onQuickAction = jest.fn();
    render(<DashboardModule onQuickAction={onQuickAction} />);

    fireEvent.click(screen.getByRole('button', { name: 'Nouveau document' }));
    fireEvent.click(screen.getByRole('button', { name: 'Planifier événement' }));
    fireEvent.click(screen.getByRole('button', { name: 'Contacter équipe' }));
    fireEvent.click(screen.getByRole('button', { name: 'Voir rapports' }));

    expect(onQuickAction.mock.calls.map(([action]) => action)).toEqual([
      'new-document',
      'schedule-event',
      'contact-team',
      'view-reports',
    ]);
  });

  it('orders upcoming events and opens the calendar', () => {
    const onEventSelect = jest.fn();
    const onOpenCalendar = jest.fn();
    render(
      <DashboardModule
        events={[
          { id: 'later', title: 'Plus tard', location: 'B', startsAt: '2026-11-02T10:00:00' },
          { id: 'first', title: 'En premier', location: 'A', startsAt: '2026-10-02T10:00:00' },
        ]}
        onEventSelect={onEventSelect}
        onOpenCalendar={onOpenCalendar}
      />
    );

    const eventButtons = screen.getAllByRole('button').filter((button) => /En premier|Plus tard/.test(button.textContent ?? ''));
    expect(eventButtons[0]).toHaveTextContent('En premier');
    fireEvent.click(screen.getByRole('button', { name: /En premier/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Calendrier' }));
    expect(onEventSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'first' }));
    expect(onOpenCalendar).toHaveBeenCalledTimes(1);
  });

  it('supports hiding privileged performance data', () => {
    render(<DashboardModule showPerformance={false} quickActions={[]} />);
    expect(screen.queryByRole('heading', { name: 'Aperçu des performances' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Voir rapports' })).not.toBeInTheDocument();
  });
});
