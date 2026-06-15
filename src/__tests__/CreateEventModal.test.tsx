import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CreateEventModal } from '../components/CreateEventModal';

const people = [
  { id: 'alice', name: 'Alice Dupont', role: 'Communication' },
  { id: 'karim', name: 'Karim Payet', role: 'Logistique' },
];

describe('CreateEventModal component', () => {
  it('does not render when closed', () => {
    render(<CreateEventModal isOpen={false} people={people} onCancel={jest.fn()} onCreate={jest.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('selects assignees and submits the event values', () => {
    const handleCreate = jest.fn();

    render(<CreateEventModal isOpen people={people} onCancel={jest.fn()} onCreate={handleCreate} />);

    fireEvent.change(screen.getByLabelText('Titre'), {
      target: { value: 'Conseil municipal' },
    });
    fireEvent.change(screen.getByLabelText('Date de début'), {
      target: { value: '2026-06-15' },
    });
    fireEvent.change(screen.getByLabelText('Lieu'), {
      target: { value: 'Salle du conseil' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sélectionner des personnes/i }));
    fireEvent.click(screen.getByRole('option', { name: /Alice Dupont/ }));

    fireEvent.click(screen.getByRole('button', { name: "Créer l'événement" }));

    expect(handleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Conseil municipal',
        date: '2026-06-15',
        location: 'Salle du conseil',
        assigneeIds: ['alice'],
      })
    );
  });

  it('calls onCancel from the close button', () => {
    const handleCancel = jest.fn();

    render(<CreateEventModal isOpen people={people} onCancel={handleCancel} onCreate={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
