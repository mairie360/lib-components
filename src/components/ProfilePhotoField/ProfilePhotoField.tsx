'use client';

import React from 'react';
import { Upload } from 'lucide-react';

import { Avatar } from '../Avatar';
import { CancelButton } from '../ButtonPresets';
import { Field, fieldDescriptionIds } from '../Field';
import { Icon } from '../Icon';
import { componentMarker, withoutMarker } from '../component-marker';

export interface ProfilePhotoFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange' | 'value' | 'accept' | 'multiple'> {
  label: React.ReactNode;
  /** URL of the current photo (preview); without it the initials are shown. */
  value?: string | null;
  /** Initials shown when there is no photo (« QT »). */
  initials: string;
  /** Called with the accepted file, or `null` on « Retirer ». Rejected files never reach it. */
  onChange: (file: File | null) => void;
  /** Accepted MIME types (JPG and PNG by default). */
  accept?: readonly string[];
  /** Maximum size in bytes (2 Mo by default). */
  maxSize?: number;
  /** Error from the front (upload refused by the server…); shown before the built-in checks. */
  error?: React.ReactNode;
  hint?: React.ReactNode;
}

export const PROFILE_PHOTO_FORMAT_ERROR = 'Ce format n’est pas accepté. Choisissez un fichier JPG ou PNG.';
export const PROFILE_PHOTO_SIZE_ERROR = 'Ce fichier dépasse 2 Mo. Choisissez une image plus légère.';
const DEFAULT_ACCEPT = ['image/jpeg', 'image/png'] as const;
const formatSize = (bytes: number) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',')} Mo` : `${Math.max(1, Math.round(bytes / 1000))} Ko`);

/**
 * Profile photo (MAIR-936, Figma `FileField/ProfilePhoto`): the avatar (photo or initials) next to a drop
 * zone. Empty: « Glisser un fichier ou parcourir ». With a photo: file name and weight, « Remplacer · Retirer ».
 * Format and size are checked here with the shared messages.
 */
export const ProfilePhotoField = React.forwardRef<HTMLInputElement, ProfilePhotoFieldProps>(function ProfilePhotoField(
  { label, value, initials, onChange, accept = DEFAULT_ACCEPT, maxSize = 2_000_000, error, hint, required, disabled, id, className = '', style, ...props },
  ref,
) {
  const generated = React.useId();
  const inputId = id ?? `photo-${generated}`;
  const [file, setFile] = React.useState<File | null>(null);
  const [rejection, setRejection] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const shownError = error ?? rejection ?? undefined;
  const hasPhoto = Boolean(value) || Boolean(file);

  const pick = (list: FileList | null) => {
    const candidate = list?.[0];
    if (!candidate || disabled) return;
    if (!accept.includes(candidate.type)) { setRejection(PROFILE_PHOTO_FORMAT_ERROR); return; }
    if (candidate.size > maxSize) { setRejection(PROFILE_PHOTO_SIZE_ERROR); return; }
    setRejection(null); setFile(candidate); onChange(candidate);
  };
  const remove = () => { setRejection(null); setFile(null); onChange(null); };
  const link = 'cursor-pointer font-semibold text-[var(--mairie-accent)] underline underline-offset-4';

  return (
    <Field {...componentMarker('ProfilePhotoField', props)} htmlFor={inputId} label={label} hint={hint} error={shownError} required={required} disabled={disabled} className={className} style={style}>
      <div
        data-dragging={dragging || undefined}
        data-state={shownError ? 'error' : hasPhoto ? 'preview' : 'empty'}
        onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={event => { event.preventDefault(); setDragging(false); pick(event.dataTransfer.files); }}
        className={`flex items-center rounded-[var(--mairie-radius-m)] border border-dashed bg-[var(--mairie-surface-raised)] ${shownError ? 'border-[var(--mairie-error-text)]' : dragging ? 'border-[var(--mairie-accent)]' : 'border-[var(--mairie-control-border)]'}`}
        style={{ gap: 'var(--mairie-space-m)', padding: 'var(--mairie-space-m)' }}
      >
        <Avatar src={value ?? undefined} alt="" fallback={initials} size="xl" />
        <input {...withoutMarker(props)} ref={ref} id={inputId} type="file" accept={accept.join(',')} required={required} disabled={disabled}
          aria-invalid={shownError ? true : undefined} aria-describedby={fieldDescriptionIds(inputId, hint, shownError)}
          onChange={event => { pick(event.target.files); /* the same file can be picked again after « Retirer » */ event.target.value = ''; }} className="sr-only" />
        <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 'var(--mairie-space-xs)', fontSize: 'var(--mairie-text-s)' }}>
          {hasPhoto ? (
            <>
              <p className="truncate font-medium text-[var(--mairie-text)]">{file ? `${file.name} · ${formatSize(file.size)}` : 'Photo de profil actuelle'}</p>
              <div className="flex items-center" style={{ gap: 'var(--mairie-space-xs)' }}>
                <label htmlFor={inputId} className={link}>Remplacer</label>
                <span aria-hidden="true" className="text-[var(--mairie-muted)]">·</span>
                <CancelButton label="Retirer" size="xs" variant="ghost" onClick={remove} disabled={disabled} />
              </div>
            </>
          ) : (
            <>
              <span className="inline-flex items-center font-medium text-[var(--mairie-text)]" style={{ gap: 'var(--mairie-space-xs)' }}>
                <Icon icon={Upload} size="s" className="text-[var(--mairie-muted)]" />
                <label htmlFor={inputId} className="cursor-pointer">Glisser un fichier ou <span className={link}>parcourir</span></label>
              </span>
              <p className="text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-xs)' }}>PNG, JPG · {formatSize(maxSize)} max</p>
            </>
          )}
        </div>
      </div>
    </Field>
  );
});
