import React from 'react';
import { Archive, Download, File, FileImage, FileSpreadsheet, MoreVertical, Share2, Trash2 } from 'lucide-react';

import { joinFileClasses } from './files/utils';
import type { FilesViewMode, LibraryFile, LibraryFileAction, LibraryFileType } from './files/types';

export interface FileCardProps extends React.HTMLAttributes<HTMLElement> {
  file: LibraryFile;
  view?: FilesViewMode;
  onAction?: (file: LibraryFile, action: LibraryFileAction) => void;
}

const typeStyles: Record<LibraryFileType, { icon: typeof File; color: string }> = {
  archive: { icon: Archive, color: 'text-[#64748b]' },
  pdf: { icon: File, color: 'text-[#ff2438]' },
  document: { icon: File, color: 'text-[#2472ff]' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-[#00b84d]' },
  image: { icon: FileImage, color: 'text-[#a92dff]' },
};

const hasAction = (file: LibraryFile, action: LibraryFileAction) => !file.allowedActions || file.allowedActions.includes(action);

export const FileCard = ({ file, view = 'grid', onAction, className = '', ...props }: FileCardProps) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const style = typeStyles[file.type];
  const Icon = style.icon;

  const triggerAction = (action: LibraryFileAction) => {
    setMenuOpen(false);
    onAction?.(file, action);
  };

  return (
    <article className={joinFileClasses('group relative rounded-lg border border-[#ded8d0] bg-white transition hover:shadow-md', view === 'list' ? 'flex min-h-20 items-center px-4 py-3' : 'min-h-[216px] px-5 py-4 text-center', className)} {...props}>
      <button type="button" aria-label={`Ouvrir ${file.name}`} className={joinFileClasses('min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155bb5]/30', view === 'list' ? 'flex flex-1 items-center gap-4 text-left' : 'block w-full')} onClick={() => triggerAction('open')} disabled={!hasAction(file, 'open')}>
        <span className={joinFileClasses('relative inline-flex shrink-0 items-center justify-center', style.color)}>
          <Icon className={view === 'list' ? 'size-8' : 'size-9'} strokeWidth={1.8} aria-hidden="true" />
          {file.isNew && <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-[#00c853]" aria-label="Nouveau fichier" />}
        </span>
        <span className={joinFileClasses('min-w-0', view === 'grid' && 'mt-4 block')}>
          <span className="block truncate text-sm font-semibold text-[#172033]" title={file.name}>{file.name}</span>
          <span className="mt-1 block text-xs text-[#687385]">{file.sizeLabel}</span>
          <span className="mt-1 block truncate text-xs text-[#687385]">{file.owner}</span>
          <span className="mt-2 inline-block rounded-md border border-[#d8d2ca] px-2 py-0.5 text-xs text-[#243041]">{file.category}</span>
        </span>
      </button>
      <div className={joinFileClasses('flex items-center gap-2', view === 'grid' ? 'mt-5 justify-center opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100' : 'ml-4 shrink-0')}>
        {hasAction(file, 'download') && <button type="button" aria-label={`Télécharger ${file.name}`} className="rounded p-1.5 hover:bg-[#f1efec]" onClick={() => triggerAction('download')}><Download className="size-4" /></button>}
        {hasAction(file, 'share') && <button type="button" aria-label={`Partager ${file.name}`} className="rounded p-1.5 hover:bg-[#f1efec]" onClick={() => triggerAction('share')}><Share2 className="size-4" /></button>}
        <button type="button" aria-label={`Plus d’actions pour ${file.name}`} aria-expanded={menuOpen} className="rounded p-1.5 hover:bg-[#f1efec]" onClick={() => setMenuOpen((open) => !open)}><MoreVertical className="size-4" /></button>
      </div>
      {menuOpen && (
        <div role="menu" className="absolute right-3 top-[calc(100%-1rem)] z-20 min-w-40 rounded-md border border-[#ded8d0] bg-white p-1 text-left shadow-lg">
          {hasAction(file, 'open') && <button role="menuitem" type="button" className="block w-full rounded px-3 py-2 text-sm hover:bg-[#f4f2ef]" onClick={() => triggerAction('open')}>Ouvrir</button>}
          {hasAction(file, 'download') && <button role="menuitem" type="button" className="block w-full rounded px-3 py-2 text-sm hover:bg-[#f4f2ef]" onClick={() => triggerAction('download')}>Télécharger</button>}
          {hasAction(file, 'share') && <button role="menuitem" type="button" className="block w-full rounded px-3 py-2 text-sm hover:bg-[#f4f2ef]" onClick={() => triggerAction('share')}>Partager</button>}
          {hasAction(file, 'delete') && <button role="menuitem" type="button" className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-[#c92f2f] hover:bg-[#fff1f2]" onClick={() => triggerAction('delete')}><Trash2 className="size-4" />Supprimer</button>}
        </div>
      )}
    </article>
  );
};
