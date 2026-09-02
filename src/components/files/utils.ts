import type { LibraryFileType } from './types';

export const joinFileClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const normalizeFileSearch = (value: string) =>
  value.toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const getLibraryFileType = (fileName: string): LibraryFileType => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (['doc', 'docx', 'odt', 'ppt', 'pptx'].includes(extension ?? '')) return 'document';
  if (['xls', 'xlsx', 'ods', 'csv'].includes(extension ?? '')) return 'spreadsheet';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension ?? '')) return 'image';
  return 'archive';
};

export const formatFileSize = (sizeBytes: number) => {
  if (sizeBytes >= 1024 ** 3) return `${(sizeBytes / 1024 ** 3).toFixed(1)} GB`;
  if (sizeBytes >= 1024 ** 2) return `${(sizeBytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
};
