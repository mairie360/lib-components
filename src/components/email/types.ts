export type EmailFolderId = 'inbox' | 'favorites' | 'important' | 'sent' | 'drafts' | 'archived' | 'trash';
export type EmailStoredFolder = Exclude<EmailFolderId, 'favorites' | 'important'>;
export type EmailComposeMode = 'new' | 'reply' | 'reply-all' | 'forward' | 'draft';
export type EmailMessageAction = 'read' | 'favorite' | 'archive' | 'trash' | 'restore' | 'delete-permanently';

export interface EmailFolder {
  id: EmailFolderId;
  label: string;
  count?: number;
}

export interface EmailAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  sizeLabel: string;
  mimeType?: string;
  file?: File;
}

export interface EmailMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  recipients: string[];
  cc?: string[];
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  folder: EmailStoredFolder;
  unread?: boolean;
  isFavorite?: boolean;
  isImportant?: boolean;
  attachments?: EmailAttachment[];
  originalFolder?: EmailStoredFolder;
}

export interface EmailComposeValues {
  to: string;
  subject: string;
  body: string;
  attachments: EmailAttachment[];
}

export interface EmailComposeRequest {
  mode: EmailComposeMode;
  values: EmailComposeValues;
  sourceMessage?: EmailMessage;
}
