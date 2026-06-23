import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CreateGroupModal } from '../components/CreateGroupModal';
import { Messaging } from '../components/Messaging';
import { NewMessageModal } from '../components/NewMessageModal';
import { defaultMessagingConversations } from '../components/messaging/defaultData';

describe('Messaging components', () => {
  it('renders the messaging module with conversations and messages', () => {
    render(<Messaging />);

    expect(screen.getByText('Messagerie interne')).toBeInTheDocument();
    expect(screen.getAllByText('Marie Dubois')[0]).toBeInTheDocument();
    expect(screen.getByText('Parfait, quelles sont vos conclusions ?')).toBeInTheDocument();
  });

  it('filters conversations from the sidebar search', () => {
    render(<Messaging />);

    fireEvent.change(screen.getByPlaceholderText('Rechercher un contact...'), {
      target: { value: 'Sophie' },
    });

    expect(screen.getByText('Sophie Leroy')).toBeInTheDocument();
    expect(screen.queryByText('Pierre Martin')).not.toBeInTheDocument();
  });

  it('calls onSendMessage when a message is submitted', () => {
    const handleSendMessage = jest.fn();
    render(<Messaging onSendMessage={handleSendMessage} />);

    fireEvent.change(screen.getByPlaceholderText('Tapez votre message...'), {
      target: { value: 'Message de test' },
    });
    fireEvent.click(screen.getByLabelText('Envoyer'));

    expect(handleSendMessage).toHaveBeenCalledWith({
      conversationId: 'marie-dubois',
      content: 'Message de test',
    });
  });

  it('submits a new direct message from the modal', () => {
    const handleSendMessage = jest.fn();

    render(
      <NewMessageModal
        isOpen
        contacts={defaultMessagingConversations}
        onCancel={jest.fn()}
        onSendMessage={handleSendMessage}
      />
    );

    fireEvent.change(screen.getByLabelText('Destinataire'), {
      target: { value: 'pierre-martin' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Bonjour Pierre' },
    });
    fireEvent.click(screen.getByText('Envoyer'));

    expect(handleSendMessage).toHaveBeenCalledWith({
      recipientId: 'pierre-martin',
      message: 'Bonjour Pierre',
    });
  });

  it('submits a group creation payload from the modal', () => {
    const handleCreateGroup = jest.fn();

    render(
      <CreateGroupModal
        isOpen
        members={defaultMessagingConversations}
        initialName="Groupe projet"
        onCancel={jest.fn()}
        onCreateGroup={handleCreateGroup}
      />
    );

    fireEvent.click(screen.getByLabelText('Marie Dubois - Finances'));
    fireEvent.click(screen.getByText('Créer le groupe'));

    expect(handleCreateGroup).toHaveBeenCalledWith({
      name: 'Groupe projet',
      description: undefined,
      memberIds: ['marie-dubois'],
    });
  });
});
