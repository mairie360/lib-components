'use client';

import React from 'react';
import { X } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from '../Icon';
import { Help } from '../Text';
import { componentMarker } from '../component-marker';

export type TagSize = Extract<Size, 's' | 'm' | 'l'>;
export interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  label: string;
  size?: TagSize;
  /** Shows the remove button; its accessible name is « Retirer <label> ». */
  onRemove?: () => void;
  removeLabel?: string;
  /** MAIR-1260: `rounded` (default, radius 6) or `pill` (fully rounded, the artifacts' role tags). */
  shape?: 'rounded' | 'pill';
  /** MAIR-1260: `neutral` (default, bordered) or `purple` (tinted, no border: « Administrateur »). */
  tone?: 'neutral' | 'purple';
}
const heights: Record<TagSize, number> = { s: 22, m: 26, l: 30 };

/** Free label (keyword, theme), removable or not (MAIR-608, Figma `Base/Tag`). */
export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag({ label, size = 'm', onRemove, removeLabel, shape = 'rounded', tone = 'neutral', className = '', style, ...props }, ref) {
  return (
    <span {...props} {...componentMarker('Tag', props)} ref={ref} data-size={size} data-shape={shape} data-tone={tone} className={`inline-flex shrink-0 items-center gap-1 border font-medium leading-none ${shape === 'pill' ? 'rounded-full' : 'rounded-md'} ${tone === 'purple' ? 'border-transparent bg-[var(--mairie-purple-surface)] text-[var(--mairie-purple-text)]' : 'border-[var(--mairie-control-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)]'} ${className}`.replace(/\s+/g, ' ').trim()}
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
  if (items.length === 0) return emptyText ? <Help {...componentMarker('TagList', props)}>{emptyText}</Help> : null;
  return (
    <ul {...props} {...componentMarker('TagList', props)} aria-label={label} className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {items.map(item => <li key={item}><Tag label={item} size={size} onRemove={onRemove ? () => onRemove(item) : undefined} /></li>)}
    </ul>
  );
};
