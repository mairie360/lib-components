import React from 'react';
import { Save } from 'lucide-react';

import { SettingsSection, settingsFieldClassName } from './settings/controls';
import { settingsServiceOptions } from './settings/defaultData';
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
  serviceOptions = settingsServiceOptions,
  maxPhotoSizeBytes = 2 * 1024 * 1024,
  onSave,
  onPhotoChange,
  className = '',
  ...props
}: SettingsProfilePanelProps) => {
  const [draft, setDraft] = React.useState(profile);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);

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
    onSave?.(draft);
    setStatus('Modifications enregistrées.');
  };

  return (
    <div className={className} {...props}>
      <SettingsSection title="Informations personnelles">
        <form className="space-y-6" onSubmit={submit}>
          <div className="flex flex-wrap items-center gap-4 border-b border-[#e3e0dc] pb-6">
            {draft.avatarUrl ? (
              <img
                src={draft.avatarUrl}
                alt={`Photo de ${draft.fullName}`}
                className="size-20 rounded-full object-cover"
              />
            ) : (
              <div className="grid size-20 place-items-center rounded-full bg-[#ebe9e6] text-lg font-medium text-[#344054]">
                {draft.initials}
              </div>
            )}
            <div>
              <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-4 text-sm font-semibold text-[#172033] hover:bg-white">
                Changer la photo
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  aria-label="Changer la photo"
                  className="sr-only"
                  onChange={handlePhoto}
                />
              </label>
              <p className="mt-2 text-sm text-[#667085]">Formats acceptés: JPG, PNG. Taille max: 2MB</p>
              {photoError && <p role="alert" className="mt-1 text-sm text-[#b42318]">{photoError}</p>}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="text-sm font-semibold text-[#172033]">
              Nom complet
              <input
                className={`${settingsFieldClassName} mt-1 font-normal`}
                value={draft.fullName}
                required
                onChange={(event) => update('fullName', event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-[#172033]">
              Adresse e-mail
              <input
                type="email"
                className={`${settingsFieldClassName} mt-1 font-normal`}
                value={draft.email}
                required
                onChange={(event) => update('email', event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-[#172033]">
              Téléphone
              <input
                type="tel"
                className={`${settingsFieldClassName} mt-1 font-normal`}
                value={draft.phone}
                onChange={(event) => update('phone', event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-[#172033]">
              Service
              <select
                className={`${settingsFieldClassName} mt-1 font-normal`}
                value={draft.service}
                onChange={(event) => update('service', event.target.value)}
              >
                {serviceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-[#172033]">
              Poste
              <input
                className={`${settingsFieldClassName} mt-1 font-normal`}
                value={draft.position}
                onChange={(event) => update('position', event.target.value)}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-[#172033]">
            Biographie
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-[#d8d2ca] bg-white px-3 py-2 font-normal outline-none focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20"
              value={draft.biography}
              onChange={(event) => update('biography', event.target.value)}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-md bg-[#1256a6] px-4 text-sm font-semibold text-white hover:bg-[#0f4a90]">
              <Save className="size-4" />
              Enregistrer les modifications
            </button>
            {status && <span role="status" className="text-sm font-medium text-[#315f5c]">{status}</span>}
          </div>
        </form>
      </SettingsSection>
    </div>
  );
};

