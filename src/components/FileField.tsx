'use client';

import React from 'react';
import { Upload } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Field, fieldDescriptionIds } from './Field';
import { Icon } from './Icon';
import { CancelButton } from './ButtonPresets';

export interface FileFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange' | 'value'> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: Size;
  /** Selected files (controlled by the consumer, who validates size and type). */
  files?: readonly File[];
  onChange?: (files: File[]) => void;
  /** Preview URL of the first file (e.g. an object URL of a photo). */
  previewSrc?: string;
  prompt?: string;
  /** Human-readable constraint shown under the prompt, e.g. "PNG, JPG · 2 Mo max". */
  constraint?: React.ReactNode;
}

const formatSize = (bytes: number) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1).replace('.0', '')} Mo` : `${Math.max(1, Math.round(bytes / 1000))} Ko`);

/** File input with drop zone and preview (MAIR-608, Figma `Base/FileField`). */
export const FileField = React.forwardRef<HTMLInputElement, FileFieldProps>(function FileField(
  { label, hint, error, size = 'm', files = [], onChange, previewSrc, prompt = 'Glisser un fichier ou parcourir', constraint, required, disabled, id, className = '', style, multiple, ...props },
  ref,
) {
  const generated = React.useId();
  const inputId = id ?? `file-${generated}`;
  const [dragging, setDragging] = React.useState(false);
  const emit = (list: FileList | null) => { if (!list || disabled) return; onChange?.(Array.from(list)); };
  return (
    <Field htmlFor={inputId} label={label} hint={hint} error={error} required={required} size={size} disabled={disabled} className={className} style={style}>
      <div
        data-dragging={dragging || undefined}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); emit(event.dataTransfer.files); }}
        className={`flex flex-col items-center justify-center rounded-[var(--mairie-radius-m)] border border-dashed bg-[var(--mairie-surface-raised)] text-center ${error ? 'border-[var(--mairie-error-text)]' : dragging ? 'border-[var(--mairie-accent)]' : 'border-[var(--mairie-control-border)]'}`}
        style={{ gap: 'var(--mairie-space-s)', padding: 'var(--mairie-space-l) var(--mairie-space-m)' }}
      >
        <input {...props} ref={ref} id={inputId} type="file" multiple={multiple} required={required} disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={fieldDescriptionIds(inputId, hint, error)} onChange={(event) => { emit(event.target.files); /* the same file can be picked again after « Retirer » */ event.target.value = ''; }} className="sr-only" />
        {files.length > 0 ? (
          <>
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- object URL preview provided by the consumer
              <img src={previewSrc} alt="" className="rounded-full object-cover" style={{ width: 'var(--mairie-avatar-xl)', height: 'var(--mairie-avatar-xl)' }} />
            ) : null}
            <p className="font-medium text-[var(--mairie-text)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{files.map((file) => `${file.name} · ${formatSize(file.size)}`).join(', ')}</p>
            <div className="flex items-center" style={{ gap: 'var(--mairie-space-s)' }}>
              <label htmlFor={inputId} className="cursor-pointer font-semibold text-[var(--mairie-accent)] underline underline-offset-4" style={{ fontSize: 'var(--mairie-text-s)' }}>Remplacer</label>
              <CancelButton label="Retirer" size="xs" variant="ghost" onClick={() => onChange?.([])} disabled={disabled} />
            </div>
          </>
        ) : (
          <>
            <Icon icon={Upload} size="l" className="text-[var(--mairie-muted)]" />
            <label htmlFor={inputId} className="cursor-pointer font-medium text-[var(--mairie-text)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{prompt}</label>
            {constraint ? <p className="text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-xs)' }}>{constraint}</p> : null}
          </>
        )}
      </div>
    </Field>
  );
});
