import React from 'react';
import { Upload } from 'lucide-react';

import { ConfirmModal } from './ConfirmModal';
import { FileCard } from './FileCard';
import { FilesToolbar } from './FilesToolbar';
import { FileUploadModal } from './FileUploadModal';
import { defaultFileCategories, defaultLibraryFiles } from './files/defaultData';
import { formatFileSize, getLibraryFileType, joinFileClasses, normalizeFileSearch } from './files/utils';
import type { FileUploadValues, FilesFilterState, FilesSortMode, FilesViewMode, LibraryFile, LibraryFileAction, LibraryFileType } from './files/types';

export interface FilesModuleProps extends React.HTMLAttributes<HTMLElement> {
  files?: LibraryFile[];
  categories?: string[];
  currentUserName?: string;
  defaultView?: FilesViewMode;
  canUpload?: boolean;
  onOpenFile?: (file: LibraryFile) => void;
  onDownloadFile?: (file: LibraryFile) => void;
  onShareFile?: (file: LibraryFile) => void;
  onDeleteFile?: (file: LibraryFile) => void;
  onUploadFile?: (values: FileUploadValues) => void;
  onFiltersChange?: (filters: FilesFilterState) => void;
}

export const FilesModule = ({
  files,
  categories = defaultFileCategories,
  currentUserName = 'Utilisateur actuel',
  defaultView = 'grid',
  canUpload = true,
  onOpenFile,
  onDownloadFile,
  onShareFile,
  onDeleteFile,
  onUploadFile,
  onFiltersChange,
  className = '',
  ...props
}: FilesModuleProps) => {
  const [internalFiles, setInternalFiles] = React.useState(defaultLibraryFiles);
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState<LibraryFileType | 'all'>('all');
  const [sort, setSort] = React.useState<FilesSortMode>('name');
  const [view, setView] = React.useState<FilesViewMode>(defaultView);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<LibraryFile | null>(null);
  const [status, setStatus] = React.useState('');
  const resolvedFiles = files ?? internalFiles;

  const updateFilters = (next: Partial<FilesFilterState>) => {
    const filters = { search, type, sort, view, ...next };
    onFiltersChange?.(filters);
  };
  const changeSearch = (value: string) => { setSearch(value); updateFilters({ search: value }); };
  const changeType = (value: LibraryFileType | 'all') => { setType(value); updateFilters({ type: value }); };
  const changeSort = (value: FilesSortMode) => { setSort(value); updateFilters({ sort: value }); };
  const changeView = (value: FilesViewMode) => { setView(value); updateFilters({ view: value }); };

  const normalizedSearch = normalizeFileSearch(search);
  const visibleFiles = resolvedFiles
    .filter((file) => type === 'all' || file.type === type)
    .filter((file) => normalizeFileSearch(file.name).includes(normalizedSearch))
    .sort((left, right) => {
      if (sort === 'recent') return new Date(right.modifiedAt).getTime() - new Date(left.modifiedAt).getTime();
      if (sort === 'size') return right.sizeBytes - left.sizeBytes;
      return left.name.localeCompare(right.name, 'fr-FR', { sensitivity: 'base' });
    });

  const handleAction = (file: LibraryFile, action: LibraryFileAction) => {
    if (action === 'open') onOpenFile?.(file);
    if (action === 'download') onDownloadFile?.(file);
    if (action === 'share') onShareFile?.(file);
    if (action === 'delete') setPendingDelete(file);
  };

  const uploadFile = (values: FileUploadValues) => {
    onUploadFile?.(values);
    if (files === undefined) {
      setInternalFiles((current) => [...current, {
        id: `file-${Date.now()}`,
        name: values.file.name,
        type: getLibraryFileType(values.file.name),
        sizeBytes: values.file.size,
        sizeLabel: formatFileSize(values.file.size),
        owner: currentUserName,
        category: values.category,
        modifiedAt: new Date().toISOString(),
        isNew: true,
      }]);
    }
    setUploadOpen(false);
    setStatus(`${values.file.name} a été téléchargé.`);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    onDeleteFile?.(pendingDelete);
    if (files === undefined) setInternalFiles((current) => current.filter((file) => file.id !== pendingDelete.id));
    setStatus(`${pendingDelete.name} a été supprimé.`);
    setPendingDelete(null);
  };

  return (
    <section className={joinFileClasses('space-y-6 bg-[#f5f3f0] text-[#172033]', className)} {...props}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-[28px] font-bold leading-tight">Gestion des Fichiers</h1><p className="mt-1 text-base text-[#687385]">Organisez et partagez vos documents</p></div>
        {canUpload && <button type="button" className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#155bb5] px-4 py-2 text-sm font-semibold text-white" onClick={() => setUploadOpen(true)}><Upload className="size-4" />Télécharger un fichier</button>}
      </div>
      <FilesToolbar search={search} type={type} sort={sort} view={view} onSearchChange={changeSearch} onTypeChange={changeType} onSortChange={changeSort} onViewChange={changeView} />
      {status && <p role="status" className="rounded-md border border-[#b9d6d5] bg-white px-4 py-3 text-sm text-[#285c59]">{status}</p>}
      <div data-testid="files-results" className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6' : 'space-y-3'}>
        {visibleFiles.map((file) => <FileCard key={file.id} file={file} view={view} onAction={handleAction} />)}
      </div>
      {visibleFiles.length === 0 && <div className="rounded-lg border border-dashed border-[#d8d2ca] bg-white px-6 py-16 text-center text-sm text-[#687385]">Aucun fichier ne correspond à vos critères.</div>}
      <FileUploadModal isOpen={uploadOpen} categories={categories} existingNames={resolvedFiles.map((file) => file.name)} onCancel={() => setUploadOpen(false)} onUpload={uploadFile} />
      <ConfirmModal isOpen={pendingDelete !== null} title="Supprimer ce fichier ?" message={pendingDelete ? `Le fichier ${pendingDelete.name} sera supprimé définitivement.` : ''} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
    </section>
  );
};
