'use client';

import React from 'react';

import { IconButton } from '../IconButton';
import { BodySmall, Caption } from '../Text';

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** 1-based current page. */
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  /** Disables the controls while a page loads. */
  loading?: boolean;
  /** Plural noun for the summary: « 21 – 40 sur 128 éléments ». */
  itemsLabel?: string;
  label?: string;
}
export function paginationSummary(page: number, pageSize: number, total: number, itemsLabel = 'éléments'): string {
  if (total <= 0) return `0 ${itemsLabel}`;
  const first = (page - 1) * pageSize + 1; const last = Math.min(total, page * pageSize);
  return `${first} – ${last} sur ${total} ${itemsLabel}`;
}

/** List pagination: shown range, previous/next, current page (MAIR-608, Figma `Base/Pagination`). */
export const Pagination = ({ page, pageSize, total, onChange, loading = false, itemsLabel, label = 'Pagination', className = '', ...props }: PaginationProps) => {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const state = loading ? 'loading' : page <= 1 && page >= pages ? 'single' : page <= 1 ? 'first' : page >= pages ? 'last' : 'default';
  return (
    <nav {...props} aria-label={label} aria-busy={loading || undefined} data-state={state} className={`flex flex-wrap items-center justify-between gap-3 ${className}`.trim()}>
      <Caption>{paginationSummary(page, pageSize, total, itemsLabel)}</Caption>
      <div className="flex items-center gap-2">
        <IconButton preset="previous" size="s" disabled={loading || page <= 1} onClick={() => onChange(page - 1)} />
        <BodySmall as="span" aria-live="polite" aria-current="page">Page {page} / {pages}</BodySmall>
        <IconButton preset="next" size="s" disabled={loading || page >= pages} onClick={() => onChange(page + 1)} />
      </div>
    </nav>
  );
};
