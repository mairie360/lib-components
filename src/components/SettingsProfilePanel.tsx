import React from 'react';
import { Save } from 'lucide-react';

import { SettingsSection, settingsFieldClassName } from './settings/controls';
import type { SettingsOption, SettingsProfile } from './settings/types';

export interface SettingsProfilePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  profile: SettingsProfile;
  serviceOptions?: SettingsOption[];
  maxPhotoSizeBytes?: number;
  onSave?: (profile: SettingsProfile) => void;
  onPhotoChange?: (file: File) => void;
}

export const SettingsProfilePanel = ({
  profile,
  serviceOptions = [],
  maxPhotoSizeBytes = 2 * 1024 * 1024,
  onSave,
  onPhotoChange,
  className = '',
  ...props
}: SettingsProfilePanelProps) => {
  const [draft, setDraft] = React.useState(profile);
  const [photoError, setPhotoError] = React.useState<string | null>(null);

  React.useEffect(() => setDraft(profile), [profile]);

  const update = (field: keyof SettingsProfile, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validType = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!validType) {
      setPhotoError('Format non pris en charge. Utilisez un fichier JPG ou PNG.');
      event.target.value = '';
      return;
    }
    if (file.size > maxPhotoSizeBytes) {
      setPhotoError('La photo ne doit pas dépasser 2 Mo.');
      event.target.value = '';
      return;
    }
    setPhotoError(null);
    onPhotoChange?.(file);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSave) return;
    onSave(draft);
  };

  return (
    <div className={className} {...props}>
      <SettingsSection title="Informations personnelles">
        <form className="space-y-6" onSubmit={submit}>
          <div className="flex flex-wrap items-center gap-4 border-b border-[var(--mairie-border)] pb-6">
            {draft.avatarUrl ? (
              <img
                src={draft.avatarUrl}
                alt={`Photo de ${draft.fullName}`}
                className="size-20 rounded-full object-cover"
              />
            ) : (
              <div className="grid size-20 place-items-center rounded-full bg-[var(--mairie-surface-raised)] text-lg font-medium text-[var(--mairie-text)]">
                {draft.initials}
              </div>
            )}
            {onPhotoChange && <div>
              <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-4 text-sm font-semibold text-[var(--mairie-text)] hover:bg-[var(--mairie-surface)]">
                Changer la photo
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  aria-label="Changer la photo"
                  className="sr-only"
                  onChange={handlePhoto}
                />
              </label>
              <p className="mt-2 text-sm text-[var(--mairie-muted)]">Formats acceptés: JPG, PNG. Taille max: 2MB</p>
              {photoError && <p role="alert" className="mt-1 text-sm text-[var(--mairie-error-text)]">{photoError}</p>}
            </div>}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="text-sm font-semibold text-[var(--mairie-text)]">
              Nom complet
              <input
                className={`${settingsFieldClassName} mt-1 font-normal`}
                value={draft.fullName}
                required
                disabled={!onSave}
                onChange={(event) => update('fullName', event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-[var(--mairie-text)]">
              Adresse e-mail
              <input
                type="email"
                className={`${settingsFieldClassName} mt-1 font-normal`}
                value={draft.email}
                required
                disabled={!onSave}
                onChange={(event) => update('email', event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-[var(--mairie-text)]">
              Téléphone
              <input
                type="tel"
                className={`${settingsFieldClassName} mt-1 font-normal`}
                value={draft.phone}
                disabled={!onSave}
                onChange={(event) => update('phone', event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-[var(--mairie-text)]">
              Service
              {serviceOptions.length > 0 ? (
                <select
                  className={`${settingsFieldClassName} mt-1 font-normal`}
                  value={draft.service}
                  disabled={!onSave}
                  onChange={(event) => update('service', event.target.value)}
                >
                  {!serviceOptions.some((option) => option.value === draft.service) && <option value={draft.service}>{draft.service || 'Non renseigné'}</option>}
                  {serviceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              ) : (
                <input className={`${settingsFieldClassName} mt-1 font-normal`} value={draft.service} placeholder="Non renseigné" readOnly />
              )}
            </label>
            <label className="text-sm font-semibold text-[var(--mairie-text)]">
              Poste
              <input
                className={`${settingsFieldClassName} mt-1 font-normal`}
                value={draft.position}
                disabled={!onSave}
                onChange={(event) => update('position', event.target.value)}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-[var(--mairie-text)]">
            Biographie
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-3 py-2 font-normal outline-none focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20"
              value={draft.biography}
              disabled={!onSave}
              onChange={(event) => update('biography', event.target.value)}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            {onSave && <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--mairie-action-background)] px-4 text-sm font-semibold text-[var(--mairie-on-action)] hover:bg-[var(--mairie-action-hover-background)]">
              <Save className="size-4" />
              Enregistrer les modifications
            </button>}
          </div>
        </form>
      </SettingsSection>
    </div>
  );
};
