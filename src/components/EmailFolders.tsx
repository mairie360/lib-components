import React from 'react';
import { Archive, FilePenLine, Inbox, Search, Send, Star, Trash2, TriangleAlert } from 'lucide-react';

import { defaultEmailFolders } from './email/defaultData';
import { joinEmailClasses } from './email/utils';
import type { EmailFolder, EmailFolderId } from './email/types';

export interface EmailFoldersProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  folders?: EmailFolder[];
  activeFolder: EmailFolderId;
  search: string;
  onSelect: (folder: EmailFolderId) => void;
  onSearchChange: (value: string) => void;
  onCompose: () => void;
}

const icons = { inbox: Inbox, favorites: Star, important: TriangleAlert, sent: Send, drafts: FilePenLine, archived: Archive, trash: Trash2 };

export const EmailFolders = ({ folders = defaultEmailFolders, activeFolder, search, onSelect, onSearchChange, onCompose, className = '', ...props }: EmailFoldersProps) => (
  <aside className={joinEmailClasses('border-r border-[#d7d2cc] bg-white p-4', className)} {...props}>
    <button type="button" aria-label="Nouveau message" className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#155bb5] px-4 text-sm font-semibold text-white" onClick={onCompose}><span className="text-lg" aria-hidden="true">+</span>Nouveau message</button>
    <label className="relative mt-4 block"><span className="sr-only">Rechercher des e-mails</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" /><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Rechercher..." className="h-9 w-full rounded-md border border-[#d8d2ca] pl-10 pr-3 text-sm outline-none focus:border-[#155bb5]" /></label>
    <nav aria-label="Dossiers e-mail" className="mt-4 space-y-1">
      {folders.map((folder) => {
        const Icon = icons[folder.id];
        return <button key={folder.id} type="button" aria-current={activeFolder === folder.id ? 'page' : undefined} className={joinEmailClasses('flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition', activeFolder === folder.id ? 'bg-[#155bb5] font-semibold text-white' : 'text-[#243041] hover:bg-[#f4f2ef]')} onClick={() => onSelect(folder.id)}><Icon className="size-4" aria-hidden="true" /><span className="min-w-0 flex-1 truncate">{folder.label}</span>{folder.count !== undefined && <span className={joinEmailClasses('rounded-md px-2 py-0.5 text-xs font-semibold', activeFolder === folder.id ? 'bg-white/20 text-white' : 'bg-[#4a918d] text-white')}>{folder.count}</span>}</button>;
      })}
    </nav>
  </aside>
);
