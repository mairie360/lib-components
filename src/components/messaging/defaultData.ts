import type { MessagingConversation, MessagingMessage } from './types';

export const defaultMessagingConversations: MessagingConversation[] = [
  {
    id: 'marie-dubois',
    name: 'Marie Dubois',
    department: 'Finances',
    initials: 'MD',
    presence: 'online',
    lastMessage: 'Le budget a été validé pour le projet',
    lastMessageAt: '14:32',
    unreadCount: 2,
  },
  {
    id: 'pierre-martin',
    name: 'Pierre Martin',
    department: 'Urbanisme',
    initials: 'PM',
    lastMessage: 'Pouvez-vous envoyer le rapport ?',
    lastMessageAt: '13:45',
  },
  {
    id: 'sophie-leroy',
    name: 'Sophie Leroy',
    department: 'Culture',
    initials: 'SL',
    presence: 'online',
    lastMessage: 'Réunion reportée à demain',
    lastMessageAt: '12:18',
    unreadCount: 1,
  },
  {
    id: 'thomas-bernard',
    name: 'Thomas Bernard',
    department: 'Travaux',
    initials: 'TB',
    lastMessage: 'Documents envoyes',
    lastMessageAt: '11:30',
  },
  {
    id: 'equipe-direction',
    name: 'Equipe Direction',
    department: 'Groupe',
    kind: 'group',
    initials: 'ED',
    presence: 'online',
    lastMessage: 'Nouvelle procédure disponible',
    lastMessageAt: 'Hier',
    unreadCount: 3,
  },
];

export const defaultMessagingMessages: MessagingMessage[] = [
  {
    id: 'message-1',
    conversationId: 'marie-dubois',
    content: "Bonjour Jean, j'ai examiné le dossier du projet de rénovation.",
    sentAt: '14:25',
    direction: 'incoming',
  },
  {
    id: 'message-2',
    conversationId: 'marie-dubois',
    content: 'Parfait, quelles sont vos conclusions ?',
    sentAt: '14:27',
    direction: 'outgoing',
  },
  {
    id: 'message-3',
    conversationId: 'marie-dubois',
    content: 'Le budget a été validé pour le projet. Nous pouvons commencer la phase suivante.',
    sentAt: '14:32',
    direction: 'incoming',
  },
];
