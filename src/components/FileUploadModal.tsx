import React from 'react';
import { Upload, X } from 'lucide-react';

import { defaultAcceptedFileExtensions, defaultFileCategories } from './files/defaultData';
import { formatFileSize, joinFileClasses } from './files/utils';
import type { FileUploadValues } from './files/types';

export interface FileUploadModalProps {
  isOpen: boolean;
  categories?: string[];
  acceptedExtensions?: string[];
  maxFileSizeBytes?: number;
  existingNames?: string[];
  onCancel: () => void;
  onUpload: (values: FileUploadValues) => void;
}

export const FileUploadModal = ({
  isOpen,
  categories = defaultFileCategories,
  acceptedExtensions = defaultAcceptedFileExtensions,
  maxFileSizeBytes = 25 * 1024 ** 2,
  existingNames = [],
  onCancel,
  onUpload,
}: FileUploadModalProps) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [category, setCategory] = React.useState('');
  const [error, setError] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setCategory('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectFile = (nextFile?: File) => {
    setError('');
    setFile(nextFile ?? null);
  };

  const validate = () => {
    if (!file) return 'Sélectionnez un fichier à télécharger.';
    const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
    if (!acceptedExtensions.map((value) => value.toLowerCase()).includes(extension)) return `Le type ${extension} n’est pas autorisé.`;
    if (file.size > maxFileSizeBytes) return `Le fichier dépasse la taille maximale de ${formatFileSize(maxFileSizeBytes)}.`;
    if (existingNames.some((name) => name.toLocaleLowerCase('fr-FR') === file.name.toLocaleLowerCase('fr-FR'))) return 'Un fichier portant ce nom existe déjà.';
    if (!category) return 'Sélectionnez une catégorie.';
    return '';
  };

  const submit = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    onUpload({ file: file as File, category });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mairie-overlay-background)]/45 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="w-full max-w-lg rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id={titleId} className="text-xl font-bold text-[var(--mairie-text)]">Télécharger un fichier</h2><p className="mt-1 text-sm text-[var(--mairie-muted)]">Ajouter un nouveau fichier au système</p></div>
          <button type="button" aria-label="Fermer" className="rounded p-1 text-[var(--mairie-muted)] hover:bg-[var(--mairie-surface-raised)]" onClick={onCancel}><X className="size-5" /></button>
        </div>
        <div className={joinFileClasses('mt-5 flex min-h-48 flex-col items-center justify-center rounded-md border-2 border-dashed px-5 py-6 text-center', file ? 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)]' : 'border-[var(--mairie-border)]')} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files?.[0]); }}>
          <Upload className="size-10 text-[var(--mairie-muted)]" strokeWidth={1.8} aria-hidden="true" />
          {file ? <><p className="mt-4 font-semibold text-[var(--mairie-text)]">{file.name}</p><p className="mt-1 text-sm text-[var(--mairie-muted)]">{formatFileSize(file.size)}</p></> : <p className="mt-4 text-base text-[var(--mairie-muted)]">Glissez-déposez vos fichiers ici ou</p>}
          <button type="button" className="mt-3 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-4 py-2 text-sm font-medium text-[var(--mairie-text)]" onClick={() => inputRef.current?.click()}>Parcourir les fichiers</button>
          <input ref={inputRef} type="file" className="sr-only" aria-label="Choisir un fichier" accept={acceptedExtensions.join(',')} onChange={(event) => selectFile(event.target.files?.[0])} />
        </div>
        <label className="mt-4 block text-sm font-semibold text-[var(--mairie-text)]">Catégorie
          <select value={category} onChange={(event) => { setCategory(event.target.value); setError(''); }} className="mt-1 h-9 w-full rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-3 font-normal text-[var(--mairie-text)]">
            <option value="">Sélectionner une catégorie</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        {error && <p role="alert" className="mt-3 rounded-md bg-[var(--mairie-error-surface)] px-3 py-2 text-sm text-[var(--mairie-error-text)]">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-4 py-2 text-sm font-medium" onClick={onCancel}>Annuler</button>
          <button type="button" className="rounded-md bg-[var(--mairie-action-background)] px-4 py-2 text-sm font-semibold text-[var(--mairie-on-action)]" onClick={submit}>Télécharger</button>
        </div>
      </div>
    </div>
  );
};
