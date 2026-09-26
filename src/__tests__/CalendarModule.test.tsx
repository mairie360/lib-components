import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { CalendarModule } from '../components/CalendarModule';
import type { CalendarEvent } from '../components/CalendarModule';
import { formatMonthYear } from '../components/calendar/date';
import { calendarEvents, calendarPeople, calendarServices } from '../stories/calendarFixtures';

const expectEventVisible = (title: string) => {
  expect(screen.getAllByText(title).length).toBeGreaterThan(0);
};

const expectEventHidden = (title: string) => {
  expect(screen.queryByText(title)).not.toBeInTheDocument();
};

describe('CalendarModule', () => {
  it('starts on the current month with no demo records or implicit actions', () => {
    render(<CalendarModule />);

    expect(screen.getAllByText(formatMonthYear(new Date())).length).toBeGreaterThan(0);
    expect(screen.getByText('Aucun événement à afficher.')).toBeInTheDocument();
    expectEventHidden('Conseil municipal');
    expect(screen.queryByRole('option', { name: 'Direction générale' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nouvel événement' })).not.toBeInTheDocument();
  });

  it('does not grant creation or validation from callbacks without an explicit role', () => {
    const events: CalendarEvent[] = [
      { id: 'pending', title: 'Proposition à vérifier', date: '15-06-2026', approvalStatus: 'pending' },
      { id: 'public', title: 'Événement visible', date: '15-06-2026', approvalStatus: 'approved' },
    ];

    render(
      <CalendarModule
        events={events}
        initialDate="15-06-2026"
        onCreateEvent={jest.fn()}
        onUpdateEvent={jest.fn()}
        onDeleteEvent={jest.fn()}
        onValidateEvent={jest.fn()}
      />
    );

    expectEventHidden('Proposition à vérifier');
    expectEventVisible('Événement visible');
    expect(screen.queryByRole('button', { name: 'Nouvel événement' })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByText('Événement visible')[0]);
    expect(screen.queryByRole('button', { name: 'Modifier' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Supprimer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Valider' })).not.toBeInTheDocument();
  });

  it('does not expose privileged actions when their callbacks are absent', () => {
    const events: CalendarEvent[] = [
      { id: 'pending', title: 'Proposition à vérifier', date: '15-06-2026', approvalStatus: 'pending' },
    ];

    render(<CalendarModule events={events} initialDate="15-06-2026" currentUserRole="responsable" />);

    expect(screen.queryByRole('button', { name: 'Nouvel événement' })).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Proposition à vérifier')[0]);
    expect(screen.queryByRole('button', { name: 'Modifier' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Supprimer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Valider' })).not.toBeInTheDocument();
  });

  it('renders the calendar and filters events by date, type and service', () => {
    render(
      <CalendarModule
        events={calendarEvents}
        people={calendarPeople}
        services={calendarServices}
        initialDate="15-06-2026"
        currentUserRole="responsable"
      />
    );

    expect(screen.getByRole('heading', { name: 'Calendrier' })).toBeInTheDocument();
    expectEventVisible('Conseil municipal');
    expectEventVisible('Atelier culture proposé');

    fireEvent.change(screen.getByLabelText('Filtrer par type'), {
      target: { value: 'activity' },
    });

    expectEventVisible('Atelier culture proposé');
    expectEventVisible('Marché local');
    expectEventHidden('Conseil municipal');

    fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser' }));
    fireEvent.change(screen.getByLabelText('Filtrer par service'), {
      target: { value: 'direction' },
    });

    expectEventVisible('Conseil municipal');
    expectEventHidden('Marché local');

    fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser' }));
    fireEvent.change(screen.getByLabelText('Filtrer par date'), {
      target: { value: '20-06-2026' },
    });

    expectEventVisible('Marché local');
    expectEventHidden('Conseil municipal');
  });

  it('lets every user create an event submitted for validation', () => {
    const handleCreateEvent = jest.fn();

    render(
      <CalendarModule
        currentUserRole="user"
        currentUserId="lea"
        currentUserService="culture"
        onCreateEvent={handleCreateEvent}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Nouvel événement' }));
    const dialog = screen.getByRole('dialog', { name: 'Créer un événement' });

    expect(within(dialog).queryByLabelText('Récurrence')).not.toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Titre'), {
      target: { value: 'Réunion de quartier' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Soumettre' }));

    expect(handleCreateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Réunion de quartier',
        approvalStatus: 'pending',
        createdById: 'lea',
        service: 'culture',
        recurrence: expect.objectContaining({ frequency: 'none' }),
      })
    );
    expect(screen.getByRole('status')).toHaveTextContent('Événement "Réunion de quartier" soumis à validation.');
  });

  it('lets responsables create recurring events', () => {
    const handleCreateEvent = jest.fn();

    render(<CalendarModule currentUserRole="responsable" currentUserId="alice" onCreateEvent={handleCreateEvent} />);

    fireEvent.click(screen.getByRole('button', { name: 'Nouvel événement' }));
    const dialog = screen.getByRole('dialog', { name: 'Créer un événement' });

    fireEvent.change(within(dialog).getByLabelText('Titre'), {
      target: { value: 'Permanence hebdomadaire' },
    });
    fireEvent.change(within(dialog).getByLabelText('Récurrence'), {
      target: { value: 'weekly' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lun' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Soumettre' }));

    expect(handleCreateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Permanence hebdomadaire',
        recurrence: expect.objectContaining({
          frequency: 'weekly',
          daysOfWeek: [1],
        }),
      })
    );
  });

  it('lets responsables edit and delete events', () => {
    const handleUpdateEvent = jest.fn();
    const handleDeleteEvent = jest.fn();
    const events: CalendarEvent[] = [
      {
        id: 'works',
        title: 'Réunion travaux',
        date: '15-06-2026',
        category: 'meeting',
        service: 'direction',
        approvalStatus: 'approved',
      },
    ];

    render(
      <CalendarModule
        events={events}
        initialDate="15-06-2026"
        currentUserRole="responsable"
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
      />
    );

    fireEvent.click(screen.getAllByText('Réunion travaux')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

    fireEvent.change(screen.getByLabelText('Titre'), {
      target: { value: 'Réunion travaux actualisée' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(handleUpdateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'works',
        title: 'Réunion travaux actualisée',
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));

    expect(handleDeleteEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'works',
        title: 'Réunion travaux actualisée',
      })
    );
    expect(screen.getByRole('status')).toHaveTextContent('Événement "Réunion travaux actualisée" supprimé.');
  });

  it('lets mayors validate proposed events without edit or delete actions', () => {
    const handleValidateEvent = jest.fn();
    const events: CalendarEvent[] = [
      {
        id: 'proposal',
        title: 'Atelier citoyen',
        date: '15-06-2026',
        category: 'activity',
        service: 'culture',
        approvalStatus: 'pending',
      },
    ];

    render(
      <CalendarModule
        events={events}
        initialDate="15-06-2026"
        currentUserRole="mayor"
        onValidateEvent={handleValidateEvent}
      />
    );

    fireEvent.click(screen.getAllByText('Atelier citoyen')[0]);

    expect(screen.getByText('En attente')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Modifier' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Supprimer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refuser' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    expect(handleValidateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'proposal',
        approvalStatus: 'approved',
      }),
      'approved'
    );
    expect(screen.getByRole('status')).toHaveTextContent('Événement "Atelier citoyen" validé.');
  });

  it('scopes visible events for standard users according to their rights', () => {
    const events: CalendarEvent[] = [
      {
        id: 'approved',
        title: 'Événement public',
        date: '15-06-2026',
        category: 'meeting',
        service: 'direction',
        approvalStatus: 'approved',
      },
      {
        id: 'own-pending',
        title: 'Proposition personnelle',
        date: '15-06-2026',
        category: 'activity',
        service: 'culture',
        approvalStatus: 'pending',
        createdById: 'lea',
      },
      {
        id: 'other-pending',
        title: 'Proposition autre service',
        date: '15-06-2026',
        category: 'activity',
        service: 'logistique',
        approvalStatus: 'pending',
        createdById: 'karim',
      },
    ];

    render(<CalendarModule events={events} initialDate="15-06-2026" currentUserRole="user" currentUserId="lea" />);

    expectEventVisible('Événement public');
    expectEventVisible('Proposition personnelle');
    expectEventHidden('Proposition autre service');

    fireEvent.click(screen.getAllByText('Proposition personnelle')[0]);

    expect(screen.queryByRole('button', { name: 'Modifier' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Supprimer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Valider' })).not.toBeInTheDocument();
  });
});
