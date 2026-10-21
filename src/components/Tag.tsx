'use client';

import React from 'react';
import { X } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from './Icon';
import { Help } from './Text';

export type TagSize = Extract<Size, 's' | 'm' | 'l'>;
export interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  label: string;
  size?: TagSize;
  /** Shows the remove button; its accessible name is « Retirer <label> ». */
  onRemove?: () => void;
  removeLabel?: string;
}
const heights: Record<TagSize, number> = { s: 22, m: 26, l: 30 };

/** Free label (keyword, theme), removable or not (MAIR-608, Figma `Base/Tag`). */
export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag({ label, size = 'm', onRemove, removeLabel, className = '', style, ...props }, ref) {
  return (
    <span {...props} ref={ref} data-size={size} className={`inline-flex shrink-0 items-center gap-1 rounded-md border border-[var(--mairie-control-border)] bg-[var(--mairie-surface)] font-medium leading-none text-[var(--mairie-text)] ${className}`.trim()}
      style={{ height: heights[size], paddingInline: 'var(--mairie-space-s)', fontSize: `var(--mairie-text-${size === 'l' ? 'm' : 's'})`, ...style }}>
      {label}
      {onRemove && (
        <button type="button" aria-label={removeLabel ?? `Retirer ${label}`} onClick={onRemove} className="-mr-1 inline-flex items-center justify-center rounded-sm text-[var(--mairie-muted)] hover:text-[var(--mairie-text)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--mairie-accent)]">
          <Icon icon={X} size="xs" />
        </button>
      )}
    </span>
  );
});

export interface TagListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  /** Accessible name of the list, e.g. « Étiquettes du projet ». */
  label: string;
  items: string[];
  size?: TagSize;
  onRemove?: (item: string) => void;
  /** Rendered when `items` is empty. */
  emptyText?: string;
}
/** Horizontal list of tags (Figma `Base/TagList`). */
export const TagList = ({ label, items, size = 'm', onRemove, emptyText, className = '', ...props }: TagListProps) => {
  if (items.length === 0) return emptyText ? <Help>{emptyText}</Help> : null;
  return (
    <ul {...props} aria-label={label} className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {items.map(item => <li key={item}><Tag label={item} size={size} onRemove={onRemove ? () => onRemove(item) : undefined} /></li>)}
    </ul>
  );
};
