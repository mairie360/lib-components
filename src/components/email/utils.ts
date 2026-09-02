import type { EmailMessage } from './types';

export const joinEmailClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const normalizeEmailSearch = (value: string) =>
  value.toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const formatEmailAttachmentSize = (bytes: number) => {
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const messageMatchesSearch = (message: EmailMessage, search: string) => {
  const query = normalizeEmailSearch(search);
  const value = normalizeEmailSearch(`${message.senderName} ${message.senderEmail} ${message.subject} ${message.preview} ${message.body}`);
  return value.includes(query);
};
