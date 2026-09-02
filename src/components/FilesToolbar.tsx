import React from 'react';
import { Filter, Grid3X3, List, Search } from 'lucide-react';

import { joinFileClasses } from './files/utils';
import type { FilesSortMode, FilesViewMode, LibraryFileType } from './files/types';

export interface FilesToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  search: string;
  type: LibraryFileType | 'all';
  sort: FilesSortMode;
  view: FilesViewMode;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: LibraryFileType | 'all') => void;
  onSortChange: (value: FilesSortMode) => void;
  onViewChange: (value: FilesViewMode) => void;
}

const controlClass = 'h-9 rounded-md border border-[#d4cec6] bg-white px-3 text-sm text-[#243041] outline-none focus:border-[#155bb5] focus:ring-2 focus:ring-[#155bb5]/20';

export const FilesToolbar = ({ search, type, sort, view, onSearchChange, onTypeChange, onSortChange, onViewChange, className = '', ...props }: FilesToolbarProps) => (
  <div className={joinFileClasses('flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between', className)} {...props}>
    <div className="flex flex-1 flex-col gap-3 sm:flex-row">
      <label className="relative block min-w-0 sm:w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" aria-hidden="true" />
        <span className="sr-only">Rechercher des fichiers</span>
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Rechercher des fichiers..." className={`${controlClass} w-full pl-10`} />
      </label>
      <label className="relative block sm:w-48">
        <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" aria-hidden="true" />
        <span className="sr-only">Filtrer par type</span>
        <select aria-label="Filtrer par type" value={type} onChange={(event) => onTypeChange(event.target.value as LibraryFileType | 'all')} className={`${controlClass} w-full pl-10`}>
          <option value="all">Tous les types</option><option value="pdf">PDF</option><option value="document">Documents</option><option value="spreadsheet">Tableurs</option><option value="image">Images</option><option value="archive">Archives</option>
        </select>
      </label>
      <select aria-label="Trier les fichiers" value={sort} onChange={(event) => onSortChange(event.target.value as FilesSortMode)} className={`${controlClass} sm:w-48`}>
        <option value="name">Nom (A-Z)</option><option value="recent">Date récente</option><option value="size">Taille</option>
      </select>
    </div>
    <div className="inline-flex self-start rounded-xl bg-[#e9e7e4] p-1" aria-label="Mode d’affichage">
      {([['grid', Grid3X3, 'Grille'], ['list', List, 'Liste']] as const).map(([value, Icon, label]) => (
        <button key={value} type="button" aria-pressed={view === value} className={joinFileClasses('inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium', view === value ? 'bg-white text-[#172033] shadow-sm' : 'text-[#4b5563]')} onClick={() => onViewChange(value)}>
          <Icon className="size-4" aria-hidden="true" />{label}
        </button>
      ))}
    </div>
  </div>
);
