import React from 'react';
import { X } from 'lucide-react';

import { administrationUserRoleOptions } from './administration/defaultData';
import type { AdministrationRole, AdministrationUserFormValues } from './administration/types';
import { AdministrationSelect } from './AdministrationSelect';
import { joinClasses } from './calendar/style';

export interface AdministrationUserModalProps {
  isOpen: boolean;
  initialValues?: Partial<AdministrationUserFormValues>;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  cancelLabel?: string;
  submitLabel?: string;
  onCancel: () => void;
  onCreateUser: (values: AdministrationUserFormValues) => void;
}

const defaultValues: AdministrationUserFormValues = {
  name: '',
  email: '',
  service: '',
  phone: '',
  role: 'user',
};

const fieldClassName =
  'h-9 w-full rounded-md border border-[#cfcac2] bg-white px-3 text-sm text-[#172033] outline-none transition placeholder:text-[#777b82] focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/35';

export const AdministrationUserModal = ({
  isOpen,
  initialValues,
  title = 'Nouvel utilisateur',
  subtitle = 'Créez un nouveau compte utilisateur',
  cancelLabel = 'Annuler',
  submitLabel = 'Créer',
  onCancel,
  onCreateUser,
}: AdministrationUserModalProps) => {
  const [values, setValues] = React.useState<AdministrationUserFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const titleId = React.useId();
  const subtitleId = React.useId();
  const nameId = React.useId();
  const emailId = React.useId();
  const serviceId = React.useId();
  const phoneId = React.useId();
  const roleId = React.useId();

  React.useEffect(() => {
    if (!isOpen) return;

    setValues({
      ...defaultValues,
      ...initialValues,
    });
  }, [initialValues, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof Omit<AdministrationUserFormValues, 'role'>, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onCreateUser({
      name: values.name.trim(),
      email: values.email.trim(),
      service: values.service.trim(),
      phone: values.phone.trim(),
      role: values.role,
    });
  };

  const canSubmit = values.name.trim() && values.email.trim() && values.service.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
    >
      <form
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-[512px] flex-col overflow-hidden rounded-md border border-[#d8d2ca] bg-[#f5f3f0] text-[#172033] shadow-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-5 px-6 pb-3 pt-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold leading-7 text-[#3f3f46]">
              {title}
            </h2>
            {subtitle && (
              <p id={subtitleId} className="mt-0.5 text-sm leading-5 text-[#737373]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Fermer"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[#71717a] transition hover:bg-[#ebe7e0] hover:text-[#27272a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
            onClick={onCancel}
          >
            <X className="size-5" strokeWidth={1.7} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-4 pt-4">
          <div>
            <label htmlFor={nameId} className="mb-1 block text-sm font-medium leading-5 text-[#3f3f46]">
              Nom complet
            </label>
            <input
              id={nameId}
              value={values.name}
              placeholder="Jean Dupont"
              className={fieldClassName}
              autoFocus
              onChange={(event) => handleInputChange('name', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor={emailId} className="mb-1 block text-sm font-medium leading-5 text-[#3f3f46]">
              Email
            </label>
            <input
              id={emailId}
              type="email"
              value={values.email}
              placeholder="jean.dupont@mairie360.fr"
              className={fieldClassName}
              onChange={(event) => handleInputChange('email', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor={serviceId} className="mb-1 block text-sm font-medium leading-5 text-[#3f3f46]">
              Service
            </label>
            <input
              id={serviceId}
              value={values.service}
              placeholder="Urbanisme"
              className={fieldClassName}
              onChange={(event) => handleInputChange('service', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor={phoneId} className="mb-1 block text-sm font-medium leading-5 text-[#3f3f46]">
              Téléphone
            </label>
            <input
              id={phoneId}
              type="tel"
              value={values.phone}
              placeholder="+33 1 23 45 67 89"
              className={fieldClassName}
              onChange={(event) => handleInputChange('phone', event.target.value)}
            />
          </div>

          <div>
            <label id={roleId} className="mb-1 block text-sm font-medium leading-5 text-[#3f3f46]">
              Rôle
            </label>
            <AdministrationSelect
              ariaLabel="Rôle"
              value={values.role}
              options={administrationUserRoleOptions}
              triggerClassName="h-9 border-[#cfcac2] text-[#3f3f46]"
              onValueChange={(value) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  role: value as AdministrationRole,
                }))
              }
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 px-6 pb-6 pt-3">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-[#f5f3f0] px-4 text-sm font-medium text-[#3f3f46] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/25"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={joinClasses(
              'inline-flex h-9 items-center justify-center rounded-md bg-[#1256a6] px-4 text-sm font-semibold text-white transition hover:bg-[#0f4b91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35 disabled:cursor-not-allowed disabled:bg-[#9ab9da]'
            )}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};
