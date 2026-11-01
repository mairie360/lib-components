'use client';

import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { DataState, type DataStateProps } from '../DataState';
import { Icon } from '../Icon';
import { Skeleton } from '../Skeleton';

export type SortDirection = 'asc' | 'desc';
export interface DataTableColumn<Row> {
  key: string;
  header: React.ReactNode;
  /** Cell content; defaults to `row[key]`. */
  cell?: (row: Row) => React.ReactNode;
  sortable?: boolean;
  align?: 'start' | 'end';
  /** Column width hint (CSS). */
  width?: string;
  /** Visually hidden header, e.g. the actions column (`header` stays the accessible name). */
  hideHeader?: boolean;
}
export interface DataTableProps<Row> extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'children'> {
  /** Accessible name (caption) of the table, e.g. « Utilisateurs ». */
  label: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  state?: 'default' | 'loading' | 'empty' | 'error';
  /** Props of the DataState shown for `empty` / `error`. */
  stateProps?: Partial<Omit<DataStateProps, 'state'>>;
  sort?: { key: string; direction: SortDirection };
  onSort?: (key: string, direction: SortDirection) => void;
  /** Skeleton rows while loading. */
  skeletonRows?: number;
  onRowClick?: (row: Row) => void;
  /** Extra attributes per row, e.g. `data-status`. */
  rowProps?: (row: Row) => React.HTMLAttributes<HTMLTableRowElement>;
}

/** Data table: sortable header, rows, state cells, row actions, states through DataState (MAIR-608, Figma `Base/DataTable`). */
export function DataTable<Row>({ label, columns, rows, rowKey, state = 'default', stateProps, sort, onSort, skeletonRows = 4, onRowClick, rowProps, className = '', style, ...props }: DataTableProps<Row>) {
  const toggle = (column: DataTableColumn<Row>) => {
    if (!column.sortable || !onSort) return;
    onSort(column.key, sort?.key === column.key && sort.direction === 'asc' ? 'desc' : 'asc');
  };
  const empty = state === 'empty' || (state === 'default' && rows.length === 0);
  return (
    <div className="w-full overflow-x-auto" data-state={state}>
      <table {...props} aria-busy={state === 'loading' || undefined} className={`w-full border-collapse text-left ${className}`.trim()} style={{ fontSize: 'var(--mairie-text-s)', ...style }}>
        <caption className="sr-only">{label}</caption>
        <thead className="bg-[var(--mairie-surface-raised)] text-[var(--mairie-muted)]">
          <tr>
            {columns.map(column => {
              const active = sort?.key === column.key;
              return (
                <th key={column.key} scope="col" aria-sort={column.sortable ? (active ? (sort!.direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                  className={`px-4 py-3 font-semibold uppercase tracking-wide ${column.align === 'end' ? 'text-right' : ''}`} style={{ width: column.width, fontSize: 'var(--mairie-text-xs)' }}>
                  {column.sortable && onSort ? (
                    <button type="button" onClick={() => toggle(column)} className="inline-flex items-center gap-1 uppercase hover:text-[var(--mairie-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]">
                      <span className={column.hideHeader ? 'sr-only' : undefined}>{column.header}</span>
                      <Icon icon={active ? (sort!.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown} size="xs" />
                    </button>
                  ) : <span className={column.hideHeader ? 'sr-only' : undefined}>{column.header}</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--mairie-border)] text-[var(--mairie-text)]">
          {state === 'loading' && Array.from({ length: skeletonRows }, (_, index) => (
            <tr key={`skeleton-${index}`} aria-hidden="true">{columns.map(column => <td key={column.key} className="px-4 py-3"><Skeleton size="s" /></td>)}</tr>
          ))}
          {state === 'default' && rows.map(row => (
            <tr key={rowKey(row)} {...rowProps?.(row)} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? 'cursor-pointer hover:bg-[var(--mairie-surface-raised)]' : undefined}>
              {columns.map(column => <td key={column.key} className={`px-4 py-3 align-middle ${column.align === 'end' ? 'text-right' : ''}`}>{column.cell ? column.cell(row) : String((row as Record<string, unknown>)[column.key] ?? '')}</td>)}
            </tr>
          ))}
          {(empty || state === 'error') && (
            <tr><td colSpan={columns.length} className="p-0"><DataState size="s" {...stateProps} state={state === 'error' ? 'error' : 'empty'} /></td></tr>
          )}
        </tbody>
      </table>
      {state === 'loading' && <div role="status" aria-live="polite" className="sr-only">{stateProps?.title ?? 'Chargement…'}</div>}
    </div>
  );
}
