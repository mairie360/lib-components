'use client';

import React from 'react';
import { CircleCheck, CircleX, CloudOff, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';

import type { Size, Tone } from '@mairie360/lib-components/theme';
import { Button } from './Button';
import { Icon } from './Icon';
import { Body, PanelTitle } from './Text';

export type AlertSize = Extract<Size, 's' | 'm' | 'l'>;
export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  title: string;
  description?: React.ReactNode;
  tone?: Tone;
  size?: AlertSize;
  icon?: LucideIcon;
  /** Inline action (« Réessayer », « Voir ») rendered as an outline button of the tone. */
  actionLabel?: string;
  onAction?: () => void;
  /** Shows the close button. */
  onDismiss?: () => void;
  dismissLabel?: string;
}

const icons: Record<Tone, LucideIcon> = { primary: Info, secondary: Info, neutral: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleX, info: Info };
const colours: Record<Tone, { background: string; color: string; borderColor: string }> = {
  primary: { background: 'var(--mairie-accent-surface)', color: 'var(--mairie-accent)', borderColor: 'var(--mairie-accent)' },
  secondary: { background: 'var(--mairie-secondary-surface)', color: 'var(--mairie-secondary)', borderColor: 'var(--mairie-secondary)' },
  neutral: { background: 'var(--mairie-surface-raised)', color: 'var(--mairie-text)', borderColor: 'var(--mairie-control-border)' },
  success: { background: 'var(--mairie-success-surface)', color: 'var(--mairie-success-text)', borderColor: 'var(--mairie-success-text)' },
  warning: { background: 'var(--mairie-warning-surface)', color: 'var(--mairie-warning-text)', borderColor: 'var(--mairie-warning-text)' },
  danger: { background: 'var(--mairie-error-surface)', color: 'var(--mairie-error-text)', borderColor: 'var(--mairie-error-text)' },
  info: { background: 'var(--mairie-info-surface)', color: 'var(--mairie-info-text)', borderColor: 'var(--mairie-info-text)' },
};
const padding: Record<AlertSize, string> = { s: 'var(--mairie-space-s)', m: 'var(--mairie-space-m)', l: 'var(--mairie-space-l)' };

/**
 * In-page banner at the place of its subject, kept while the situation lasts
 * (MAIR-608, Figma `Base/Alert`). Danger alerts are announced assertively.
 * Prefer `ErrorAlert`, `WarningAlert`, `InfoAlert`, `SuccessAlert`, `UnavailableAlert`.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { title, description, tone = 'info', size = 'm', icon, actionLabel, onAction, onDismiss, dismissLabel = 'Fermer le message', className = '', style, ...props }, ref,
) {
  const textSize: Size = size === 'l' ? 'm' : 's';
  return (
    <div {...props} ref={ref} role={props.role ?? (tone === 'danger' ? 'alert' : 'status')} data-tone={tone} data-size={size}
      className={`flex items-start gap-3 border-l-4 ${className}`.trim()}
      style={{ padding: padding[size], borderRadius: 'var(--mairie-radius-m)', ...colours[tone], ...style }}>
      <span className="shrink-0 pt-0.5"><Icon icon={icon ?? icons[tone]} size={size === 'l' ? 'l' : 'm'} /></span>
      <div className="min-w-0 flex-1">
        <PanelTitle as="p" size={textSize} style={{ color: 'inherit' }}>{title}</PanelTitle>
        {description && <Body size={textSize} className="mt-0.5" style={{ color: 'inherit' }}>{description}</Body>}
        {actionLabel && onAction && <div className="mt-2"><Button variant="outline" tone={tone} size="s" label={actionLabel} onClick={onAction} /></div>}
      </div>
      {onDismiss && (
        <button type="button" aria-label={dismissLabel} onClick={onDismiss} className="inline-flex shrink-0 items-center justify-center rounded-md p-1 opacity-80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]" style={{ color: 'inherit' }}>
          <Icon icon={X} size="s" />
        </button>
      )}
    </div>
  );
});

export type AlertPresetProps = Omit<AlertProps, 'tone' | 'title'> & { title?: string };
function preset(name: string, defaults: Partial<AlertProps> & { tone: Tone; title: string }) {
  const Preset = React.forwardRef<HTMLDivElement, AlertPresetProps>(function Preset(props, ref) {
    const overrides = Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined));
    return <Alert ref={ref} {...defaults} data-preset={name} {...overrides} />;
  });
  Preset.displayName = `${name}Alert`;
  return Preset;
}
/** Failure shown at the place of the problem. */
export const ErrorAlert = preset('Error', { tone: 'danger', title: 'Une erreur est survenue.' });
/** Warning before an action. */
export const WarningAlert = preset('Warning', { tone: 'warning', title: 'Attention' });
export const InfoAlert = preset('Info', { tone: 'info', title: 'Information' });
/** In-page confirmation. */
export const SuccessAlert = preset('Success', { tone: 'success', title: 'Enregistré' });
/** Service unavailable with a retry action: pass `onAction`. */
export const UnavailableAlert = preset('Unavailable', { tone: 'warning', icon: CloudOff, title: 'Service indisponible', description: 'Les données n’ont pas pu être chargées. Réessayez dans un instant.', actionLabel: 'Réessayer' });
export const AlertPresets = { error: ErrorAlert, warning: WarningAlert, info: InfoAlert, success: SuccessAlert, unavailable: UnavailableAlert } as const;
