import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';

import { CreateGroupModal } from '../components/CreateGroupModal';
import { Messaging } from '../components/Messaging';
import { NewMessageModal } from '../components/NewMessageModal';
import {
  defaultMessagingBusinessReferences,
  defaultMessagingConversations,
  defaultMessagingMessages,
} from '../stories/messagingFixtures';

const DemoMessaging = (props: ComponentProps<typeof Messaging>) => (
  <Messaging
    conversations={defaultMessagingConversations}
    messages={defaultMessagingMessages}
    businessReferences={defaultMessagingBusinessReferences}
    onSendMessage={jest.fn()}
    onNewMessageSend={jest.fn()}
    onCreateGroup={jest.fn()}
    {...props}
  />
);

describe('Messaging components', () => {
  it('renders no demo content or unsupported actions by default', () => {
    render(<Messaging />);

    expect(screen.getByText('Messagerie interne')).toBeInTheDocument();
    expect(screen.getByText('Aucune conversation trouvée.')).toBeInTheDocument();
    expect(screen.getByText('Sélectionnez une conversation pour commencer.')).toBeInTheDocument();
    expect(screen.queryByText('Marie Dubois')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nouveau message' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Créer un groupe' })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tapez votre message...')).toBeDisabled();
  });

  it('renders explicitly provided conversations and messages', () => {
    render(<DemoMessaging />);

    expect(screen.getAllByText('Marie Dubois')[0]).toBeInTheDocument();
    expect(screen.getByText('Parfait, quelles sont vos conclusions ?')).toBeInTheDocument();
  });

  it('filters conversations from the sidebar search', () => {
    render(<DemoMessaging />);

    fireEvent.change(screen.getByPlaceholderText('Rechercher un contact...'), {
      target: { value: 'Sophie' },
    });

    expect(screen.getAllByText('Sophie Leroy')[0]).toBeInTheDocument();
    expect(screen.queryByText('Pierre Martin')).not.toBeInTheDocument();
  });

  it('does not show the available users strip in the messaging sidebar', () => {
    render(<DemoMessaging />);

    expect(screen.queryByLabelText('Utilisateurs disponibles')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ouvrir la discussion avec Pierre Martin' })
    ).not.toBeInTheDocument();
  });

  it('calls onSendMessage when a message is submitted', () => {
    const handleSendMessage = jest.fn();
    render(<DemoMessaging onSendMessage={handleSendMessage} />);

    fireEvent.change(screen.getByPlaceholderText('Tapez votre message...'), {
      target: { value: 'Message de test' },
    });
    fireEvent.click(screen.getByLabelText('Envoyer'));

    expect(handleSendMessage).toHaveBeenCalledWith({
      conversationId: 'marie-dubois',
      content: 'Message de test',
    });
  });

  it('receives incoming messages passed to the module', () => {
    const { rerender } = render(<DemoMessaging />);

    rerender(
      <DemoMessaging
        incomingMessages={[
          {
            id: 'incoming-delayed-message',
            conversationId: 'marie-dubois',
            content: 'Message reçu en différé',
            sentAt: '15:02',
            authorId: 'marie-dubois',
          },
        ]}
      />
    );

    expect(screen.getAllByText('Message reçu en différé')[0]).toBeInTheDocument();
  });

  it('surfaces messaging notifications from unread conversations', () => {
    render(<DemoMessaging />);

    expect(screen.getByRole('status', { name: 'Notifications de messagerie' })).toHaveTextContent(
      '6 notifications non lues'
    );
  });

  it('opens the correct modal from each sidebar icon', () => {
    render(<DemoMessaging />);

    fireEvent.click(screen.getByLabelText('Nouveau message'));
    expect(screen.getByRole('dialog', { name: 'Nouveau message' })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Fermer'));

    fireEvent.click(screen.getByLabelText('Créer un groupe'));
    expect(screen.getByRole('dialog', { name: 'Créer un groupe' })).toBeInTheDocument();
  });

  it('uses dedicated contacts in the new message and group modals', () => {
    const contacts = [
      {
        id: 'alice-martin',
        name: 'Alice Martin',
        department: 'Urbanisme',
        kind: 'direct' as const,
      },
    ];

    render(
      <DemoMessaging
        conversations={[defaultMessagingConversations[0]]}
        contacts={contacts}
        messages={[]}
        activeConversationId={defaultMessagingConversations[0].id}
      />
    );

    fireEvent.click(screen.getByLabelText('Nouveau message'));
    expect(screen.getByRole('option', { name: 'Alice Martin - Urbanisme' })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Fermer'));

    fireEvent.click(screen.getByLabelText('Créer un groupe'));
    expect(screen.getByLabelText('Alice Martin - Urbanisme')).toBeInTheDocument();
  });

  it('uses author ids before backend direction and normalizes numeric ids', () => {
    render(
      <Messaging
        conversations={[{ id: 100, name: 'Conversation test', kind: 'direct' }]}
        messages={[
          {
            id: 'own-message',
            conversationId: 100,
            content: 'Message de l’utilisateur courant',
            authorId: '7',
            direction: 'incoming',
          },
          {
            id: 'other-message',
            conversationId: '100',
            content: 'Message de l’autre personne',
            authorId: 8,
            direction: 'outgoing',
          },
        ]}
        activeConversationId="100"
        currentUserId={7}
      />
    );

    expect(screen.getByText('Message de l’utilisateur courant').parentElement?.parentElement).toHaveClass(
      'items-end'
    );
    expect(screen.getByText('Message de l’autre personne').parentElement?.parentElement).toHaveClass(
      'items-start'
    );
  });

  it('delegates deletion without hiding a conversation before the consumer updates it', () => {
    const handleDelete = jest.fn();
    render(<DemoMessaging onConversationDelete={handleDelete} />);

    fireEvent.click(screen.getByLabelText("Plus d'actions"));
    fireEvent.click(screen.getByText('Supprimer la conversation'));

    expect(handleDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'marie-dubois' }));
    expect(screen.getByText('Bonjour Jean, j\'ai examiné le dossier du projet de rénovation.')).toBeInTheDocument();
    expect(screen.getAllByText('Pierre Martin')[0]).toBeInTheDocument();
  });

  it('delegates sending without fabricating a persisted message', () => {
    const handleSendMessage = jest.fn();
    render(<Messaging conversations={[defaultMessagingConversations[0]]} onSendMessage={handleSendMessage} />);

    expect(screen.queryByRole('button', { name: 'Appeler' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Appel vidéo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: "Plus d'actions" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Tapez votre message...'), {
      target: { value: 'Message en attente du serveur' },
    });
    fireEvent.click(screen.getByLabelText('Envoyer'));

    expect(handleSendMessage).toHaveBeenCalledWith({
      conversationId: 'marie-dubois',
      content: 'Message en attente du serveur',
    });
    expect(screen.queryByText('Message en attente du serveur')).not.toBeInTheDocument();
    expect(screen.getByText('Aucun message dans cette conversation.')).toBeInTheDocument();
  });

  it('delegates group creation without inventing a local conversation', () => {
    const handleCreateGroup = jest.fn();
    render(<Messaging conversations={[defaultMessagingConversations[0]]} onCreateGroup={handleCreateGroup} />);

    fireEvent.click(screen.getByRole('button', { name: 'Créer un groupe' }));
    fireEvent.change(screen.getByLabelText('Nom du groupe'), { target: { value: 'Groupe test' } });
    fireEvent.click(screen.getByLabelText('Marie Dubois - Finances'));
    fireEvent.click(screen.getByRole('button', { name: 'Créer le groupe' }));

    expect(handleCreateGroup).toHaveBeenCalledWith({
      name: 'Groupe test',
      description: undefined,
      memberIds: ['marie-dubois'],
    });
    expect(screen.queryByText('Groupe test')).not.toBeInTheDocument();
  });

  it('only displays incoming messages while they are provided by the consumer', () => {
    const incomingMessages = [{ id: 'server-message', conversationId: 'marie-dubois', content: 'Message reçu' }];
    const { rerender } = render(
      <Messaging conversations={[defaultMessagingConversations[0]]} incomingMessages={incomingMessages} />
    );

    expect(screen.getByText('Message reçu')).toBeInTheDocument();
    rerender(<Messaging conversations={[defaultMessagingConversations[0]]} incomingMessages={[]} />);
    expect(screen.queryByText('Message reçu')).not.toBeInTheDocument();
  });

  it('renders references and attachments without destinations as non-clickable labels', () => {
    render(
      <Messaging
        conversations={[defaultMessagingConversations[0]]}
        messages={[
          {
            id: 'message-with-unavailable-links',
            conversationId: 'marie-dubois',
            content: 'Dossier partagé',
            businessLinks: [{ id: 'project-1', title: 'Projet test', kind: 'project' }],
            attachments: [{ id: 'file-1', name: 'rapport.pdf' }],
          },
        ]}
      />
    );

    expect(screen.getByText('Projet test')).toBeInTheDocument();
    expect(screen.getByText('rapport.pdf')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Projet test' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'rapport.pdf' })).not.toBeInTheDocument();
  });

  it('adds a system emoji to the composer', () => {
    render(<DemoMessaging />);

    fireEvent.click(screen.getByLabelText('Ajouter une réaction'));
    fireEvent.click(screen.getByLabelText('Ajouter 👍'));

    expect(screen.getByPlaceholderText('Tapez votre message...')).toHaveValue('👍');
  });

  it('adds files to a message payload', () => {
    const handleSendMessage = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: jest.fn(() => 'blob:planning.pdf'),
    });
    const { container } = render(<DemoMessaging onSendMessage={handleSendMessage} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['planning'], 'planning.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByLabelText('Envoyer'));

    expect(screen.queryByRole('link', { name: /planning\.pdf/ })).not.toBeInTheDocument();
    expect(handleSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'marie-dubois',
        content: 'Pièce jointe',
        attachments: [
          expect.objectContaining({
            name: 'planning.pdf',
            type: 'application/pdf',
            url: 'blob:planning.pdf',
          }),
        ],
      })
    );
  });

  it('mentions a contact or group with @ and sends mention metadata', () => {
    const handleSendMessage = jest.fn();
    render(<DemoMessaging onSendMessage={handleSendMessage} />);

    fireEvent.change(screen.getByPlaceholderText('Tapez votre message...'), {
      target: { value: '@Éq' },
    });
    fireEvent.click(screen.getByText('@Équipe Direction'));
    expect(screen.getByPlaceholderText('Tapez votre message...')).toHaveValue('@Équipe Direction ');

    fireEvent.click(screen.getByLabelText('Envoyer'));

    expect(handleSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'marie-dubois',
        content: '@Équipe Direction',
        mentions: [
          expect.objectContaining({
            id: 'equipe-direction',
            name: 'Équipe Direction',
            kind: 'group',
          }),
        ],
      })
    );
  });

  it('offers dedicated contacts and group conversations as user mentions', () => {
    render(
      <Messaging
        conversations={[
          {
            id: 'group-culture',
            name: 'Groupe Culture',
            kind: 'group',
          },
        ]}
        contacts={[
          {
            id: 'user-alice',
            name: 'Alice Martin',
            department: 'Urbanisme',
            kind: 'direct',
          },
        ]}
        messages={[]}
        activeConversationId="group-culture"
        onSendMessage={jest.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Tapez votre message...'), {
      target: { value: '@' },
    });

    expect(screen.getByText('@Alice Martin')).toBeInTheDocument();
    expect(screen.getByText('@Groupe Culture')).toBeInTheDocument();
  });

  it('renders user and business mentions in bold with an underline', () => {
    render(
      <Messaging
        conversations={[{ id: 'group-culture', name: 'Groupe Culture', kind: 'group' }]}
        contacts={[{ id: 'user-alice', name: 'Alice Martin', kind: 'direct' }]}
        messages={[
          {
            id: 'message-with-mentions',
            conversationId: 'group-culture',
            content: 'Bonjour @Alice Martin, consultez #Rénovation mairie.',
            direction: 'incoming',
          },
        ]}
        businessReferences={[
          { id: 'project-renovation', title: 'Rénovation mairie', kind: 'project' },
        ]}
        activeConversationId="group-culture"
      />
    );

    const userMention = screen.getByText('@Alice Martin');
    const businessMention = screen.getByText('#Rénovation mairie');

    expect(userMention.tagName).toBe('STRONG');
    expect(userMention).toHaveClass('font-bold', 'underline');
    expect(userMention).toHaveAttribute('data-mention-kind', 'user');
    expect(businessMention.tagName).toBe('STRONG');
    expect(businessMention).toHaveClass('font-bold', 'underline');
    expect(businessMention).toHaveAttribute('data-mention-kind', 'business');
  });

  it('opens user mention suggestions from the @ toolbar button', () => {
    render(<DemoMessaging />);

    fireEvent.click(screen.getByLabelText('Mentionner un utilisateur'));
    expect(screen.getByPlaceholderText('Tapez votre message...')).toHaveValue('@');

    fireEvent.click(screen.getByText('@Marie Dubois'));
    expect(screen.getByPlaceholderText('Tapez votre message...')).toHaveValue('@Marie Dubois ');
  });

  it('mentions a business element with # and sends the linked reference metadata', () => {
    const handleSendMessage = jest.fn();
    render(<DemoMessaging onSendMessage={handleSendMessage} />);

    fireEvent.change(screen.getByPlaceholderText('Tapez votre message...'), {
      target: { value: '#Projet' },
    });
    fireEvent.click(screen.getByText('#Projet rénovation mairie'));
    expect(screen.getByPlaceholderText('Tapez votre message...')).toHaveValue('#Projet rénovation mairie ');

    fireEvent.click(screen.getByLabelText('Envoyer'));

    expect(handleSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'marie-dubois',
        content: '#Projet rénovation mairie',
        businessLinks: [
          expect.objectContaining({
            id: 'project-renovation-mairie',
            kind: 'project',
            title: 'Projet rénovation mairie',
          }),
        ],
      })
    );
  });

  it('sends contextual message metadata and opens the linked business element', () => {
    const handleSendMessage = jest.fn();
    const handleBusinessReferenceClick = jest.fn();
    const contextReference = {
      id: 'event-conseil-test',
      title: 'Conseil municipal',
      kind: 'event' as const,
      description: 'Événement',
    };

    render(
      <DemoMessaging
        contextReference={contextReference}
        onSendMessage={handleSendMessage}
        onBusinessReferenceClick={handleBusinessReferenceClick}
      />
    );

    expect(screen.getByLabelText('Message contextuel')).toHaveTextContent('Événement : Conseil municipal');
    fireEvent.click(screen.getByText('Ouvrir'));
    expect(handleBusinessReferenceClick).toHaveBeenCalledWith(contextReference);

    fireEvent.change(screen.getByPlaceholderText('Tapez votre message...'), {
      target: { value: 'Compte rendu partagé' },
    });
    fireEvent.click(screen.getByLabelText('Envoyer'));

    expect(handleSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'marie-dubois',
        content: 'Compte rendu partagé',
        context: contextReference,
      })
    );
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
        onCancel={jest.fn()}
        onCreateGroup={handleCreateGroup}
      />
    );

    fireEvent.change(screen.getByLabelText('Nom du groupe'), {
      target: { value: 'Groupe projet' },
    });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Rechercher un contact' }), {
      target: { value: 'Marie' },
    });

    expect(screen.queryByLabelText('Pierre Martin - Urbanisme')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Marie Dubois - Finances'));
    fireEvent.click(screen.getByText('Créer le groupe'));

    expect(handleCreateGroup).toHaveBeenCalledWith({
      name: 'Groupe projet',
      description: undefined,
      memberIds: ['marie-dubois'],
    });
  });
});
