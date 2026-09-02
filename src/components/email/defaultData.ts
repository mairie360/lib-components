import type { EmailFolder, EmailMessage } from './types';

export const defaultEmailFolders: EmailFolder[] = [
  { id: 'inbox', label: 'Boîte de réception', count: 12 },
  { id: 'favorites', label: 'Messages favoris', count: 2 },
  { id: 'important', label: 'Important', count: 3 },
  { id: 'sent', label: 'Envoyés' },
  { id: 'drafts', label: 'Brouillons', count: 2 },
  { id: 'archived', label: 'Archivés', count: 15 },
  { id: 'trash', label: 'Corbeille', count: 5 },
];

export const defaultEmailMessages: EmailMessage[] = [
  {
    id: 'accessibility-regulation', senderName: 'Direction Générale', senderEmail: 'direction.generale@mairie.fr', recipients: ['admin@mairie360.fr'],
    subject: 'Nouvelle réglementation - Accessibilité', preview: 'Nous vous informons de la mise en place de nouvelles mesures...',
    body: "Bonjour, Nous vous informons de la mise en place de nouvelles mesures d’accessibilité pour les bâtiments publics. Ces mesures entrent en vigueur le 1er janvier 2025. Veuillez trouver en pièce jointe le détail des nouvelles exigences. Cordialement, La Direction Générale",
    timestamp: '10:30', folder: 'inbox', unread: true, isFavorite: true, isImportant: true,
    attachments: [{ id: 'accessibility-pdf', name: 'Mesures_accessibilite_2025.pdf', sizeBytes: 1.2 * 1024 ** 2, sizeLabel: '1.2 MB', mimeType: 'application/pdf' }],
  },
  {
    id: 'security-training', senderName: 'Service RH', senderEmail: 'rh@mairie.fr', recipients: ['admin@mairie360.fr'],
    subject: 'Formation obligatoire sécurité', preview: 'Rappel: Formation sécurité prévue le 15 novembre...',
    body: 'La formation obligatoire à la sécurité aura lieu le 15 novembre à 9h en salle de formation.', timestamp: 'Hier', folder: 'inbox', unread: false, isImportant: true,
  },
  {
    id: 'cultural-grant', senderName: 'Préfecture', senderEmail: 'culture@prefecture.fr', recipients: ['admin@mairie360.fr', 'culture@mairie360.fr'], cc: ['direction@mairie360.fr'],
    subject: 'Subvention projet culturel', preview: 'Votre demande de subvention a été acceptée...',
    body: 'Votre demande de subvention pour le projet culturel a été acceptée. Vous trouverez les prochaines étapes dans ce message.', timestamp: '2 jours', folder: 'inbox', unread: false, isFavorite: true,
  },
  { id: 'sent-budget', senderName: 'Admin Système', senderEmail: 'admin@mairie360.fr', recipients: ['finances@mairie.fr'], subject: 'Budget validé', preview: 'Le budget a été validé.', body: 'Bonjour, le budget a été validé.', timestamp: '1 semaine', folder: 'sent' },
  { id: 'draft-council', senderName: 'Admin Système', senderEmail: 'admin@mairie360.fr', recipients: [''], subject: 'Préparation conseil', preview: 'Points à compléter...', body: 'Points à compléter avant le conseil.', timestamp: 'Hier', folder: 'drafts' },
  { id: 'archived-news', senderName: 'Association locale', senderEmail: 'contact@association.fr', recipients: ['admin@mairie360.fr'], subject: 'Actualités de septembre', preview: 'Retrouvez les actualités...', body: 'Retrouvez les actualités de septembre.', timestamp: '1 mois', folder: 'archived' },
  { id: 'trash-test', senderName: 'Service test', senderEmail: 'test@mairie.fr', recipients: ['admin@mairie360.fr'], subject: 'Message à supprimer', preview: 'Ce message est dédié au test.', body: 'Ce message est dédié au test de suppression.', timestamp: '3 jours', folder: 'trash', originalFolder: 'inbox' },
];

export const defaultEmailAttachmentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.zip'];
