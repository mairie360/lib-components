'use client';

import React, { useId } from 'react';
import { CloudOff, Inbox, TriangleAlert } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from '../Icon';
import { CreateButton, RetryButton } from '../ButtonPresets';
import { Help, PanelTitle } from '../Text';
import { Skeleton } from '../Skeleton';

export type DataStateKind = 'loading' | 'empty' | 'unavailable' | 'error';
export type DataStateSize = Extract<Size, 's' | 'm' | 'l'>;
export interface DataStateProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  state: DataStateKind;
  /** Defaults to the French text of the state. */
  title?: string;
  description?: React.ReactNode;
  size?: DataStateSize;
  /** `unavailable` and `error` render a RetryButton calling this. */
  onRetry?: () => void;
  /** `empty` renders a CreateButton calling this. */
  onCreate?: () => void;
  createLabel?: string;
  /** Replaces the default button. */
  action?: React.ReactNode;
}

const defaults: Record<DataStateKind, { title: string; description: string }> = {
  loading: { title: 'Chargement…', description: 'Les données arrivent.' },
  empty: { title: 'Aucun élément à afficher.', description: 'Les éléments apparaîtront ici dès qu’ils seront créés.' },
  unavailable: { title: 'Service indisponible.', description: 'Les données n’ont pas pu être chargées. Réessayez dans un instant.' },
  error: { title: 'Une erreur est survenue.', description: 'L’action n’a pas pu être effectuée. Réessayez ou contactez le support.' },
};
const padding: Record<DataStateSize, string> = { s: 'var(--mairie-space-m)', m: 'var(--mairie-space-l)', l: 'var(--mairie-space-xl)' };

/**
 * The one block for a data area without content: loading, empty, unavailable, error
 * (MAIR-608, Figma `Base/DataState`). Loading is a live status; the other states name a region.
 */
export const DataState = ({ state, title, description, size = 'm', onRetry, onCreate, createLabel, action, className = '', style, ...props }: DataStateProps) => {
  const titleId = useId();
  const text = defaults[state];
  const heading = title ?? text.title;
  const body = description === undefined ? text.description : description;
  const iconSize: Size = size === 's' ? 'm' : size === 'm' ? 'l' : 'xl';
  const button = action ?? (state === 'empty' && onCreate ? <CreateButton label={createLabel} onClick={onCreate} size={size} /> : (state === 'unavailable' || state === 'error') && onRetry ? <RetryButton onClick={onRetry} size={size} /> : null);
  if (state === 'loading') {
    return (
      <div {...props} role="status" aria-live="polite" aria-busy="true" data-state={state} data-size={size} className={`flex flex-col gap-3 ${className}`.trim()} style={{ padding: padding[size], ...style }}>
        <span className="sr-only">{heading}</span>
        <Skeleton.TextBlock />
      </div>
    );
  }
  const tone = state === 'error' ? 'danger' : state === 'unavailable' ? 'warning' : 'muted';
  const glyph = state === 'empty' ? Inbox : state === 'unavailable' ? CloudOff : TriangleAlert;
  return (
    <section {...props} aria-labelledby={titleId} data-state={state} data-size={size} className={`flex flex-col items-center gap-2 text-center ${className}`.trim()} style={{ padding: padding[size], ...style }}>
      <span className={tone === 'danger' ? 'text-[var(--mairie-error-text)]' : tone === 'warning' ? 'text-[var(--mairie-warning-text)]' : 'text-[var(--mairie-muted)]'}><Icon icon={glyph} size={iconSize} /></span>
      <PanelTitle id={titleId} size={size === 'l' ? 'l' : 'm'}>{heading}</PanelTitle>
      {body && <Help className="max-w-prose">{body}</Help>}
      {button && <div className="mt-2 flex flex-wrap justify-center gap-2">{button}</div>}
    </section>
  );
};
