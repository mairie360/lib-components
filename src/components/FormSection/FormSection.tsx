'use client';

import React from 'react';
import { componentMarker } from '../component-marker';

export interface FormSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Disables every control while the form submits (a `fieldset`). */
  busy?: boolean;
  /** Usually a `FormActions`. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Card grouping the fields of one form (MAIR-608, Figma `FormSection`): title, description, fields, actions. */
export const FormSection = ({ title, description, busy = false, footer, children, className = '', style, ...props }: FormSectionProps) => {
  const headingId = React.useId();
  return (
    <section {...props} {...componentMarker('FormSection', props)} aria-labelledby={headingId} aria-busy={busy || undefined} className={`rounded-[var(--mairie-radius-l)] border border-[var(--mairie-border)] bg-[var(--mairie-surface)] ${className}`.trim()} style={{ padding: 'var(--mairie-space-l)', display: 'flex', flexDirection: 'column', gap: 'var(--mairie-space-m)', ...style }}>
      {/* RGAA 11.6 (MAIR-473): the fieldset that disables the fields while busy is named by a legend
          holding the title. float-left takes the legend out of the fieldset's special legend
          rendering, so it lays out as the first flex item. */}
      <fieldset disabled={busy} className="m-0 min-w-0 border-0 p-0" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mairie-space-m)' }}>
        <legend className="float-left w-full p-0" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mairie-space-xs)' }}>
          <h2 id={headingId} className="font-semibold text-[var(--mairie-text)]" style={{ fontSize: 'var(--mairie-text-l)' }}>{title}</h2>
          {description ? <span className="block text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{description}</span> : null}
        </legend>
        {children}
      </fieldset>
      {footer}
    </section>
  );
};
