'use client';

import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { DataState, type DataStateProps } from '../DataState';
import { Icon } from '../Icon';
import { Skeleton } from '../Skeleton';
import { componentMarker, withoutMarker } from '../component-marker';
import { useMountedAnnouncement } from '../use-mounted-announcement';

export type SortDirection = 'asc' | 'desc';
/** Cell value a column sorts on; empty values (`null`, `undefined`, `''`) always go last. */
export type SortValue = string | number | Date | boolean | null | undefined;
export interface DataTableColumn<Row> {
  key: string;
  header: React.ReactNode;
  /** Cell content; defaults to `row[key]`. */
  cell?: (row: Row) => React.ReactNode;
  /** Sortable header; with the table-level `sortable`, a column opts out with `sortable: false`. */
  sortable?: boolean;
  /** MAIR-1129: value the table sorts this column on (default `row[key]`). */
  sortValue?: (row: Row) => SortValue;
  align?: 'start' | 'end';
  /** Column width hint (CSS). */
  width?: string;
  /** Visually hidden header, e.g. the actions column (`header` stays the accessible name). */
  hideHeader?: boolean;
  /**
   * MAIR-869, Figma `Base/DataTable/Cell` Kind: `text` (default), `strong` (semibold, the row's main
   * value), `content` (any child: tag, pill, user identity) or `actions` (end aligned, its buttons never
   * open the row).
   */
  kind?: 'text' | 'strong' | 'content' | 'actions';
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
  /** Server-side sort (the rows arrive sorted): current sort of the header, `onSort` asks for another. */
  sort?: { key: string; direction: SortDirection };
  onSort?: (key: string, direction: SortDirection) => void;
  /**
   * MAIR-1129: the table sorts its rows itself (empty values last). `sortable` makes every column
   * sortable (`sortable: false` on a column opts out); `sortKey` / `sortDirection` control the sort,
   * otherwise the table keeps it; `onSortChange` reports each change. First click ascending, second descending.
   */
  sortable?: boolean;
  sortKey?: string | null;
  sortDirection?: SortDirection | null;
  onSortChange?: (key: string, direction: SortDirection) => void;
  /** Skeleton rows while loading. */
  skeletonRows?: number;
  /**
   * MAIR-850: opens the row's detail. The row gets the Figma Hover state on hover and keyboard focus,
   * is focusable and opens on Entrée / Espace; buttons, links and fields inside it keep their own click.
   */
  onRowClick?: (row: Row) => void;
  /** Accessible name of an interactive row (« Ouvrir la fiche de Marie Martin »). */
  rowLabel?: (row: Row) => string;
  /** Extra attributes per row, e.g. `data-status`. */
  rowProps?: (row: Row) => React.HTMLAttributes<HTMLTableRowElement>;
}

/** Data table: sortable header, rows, state cells, row actions, states through DataState (MAIR-608, Figma `Base/DataTable`). */
const INNER_CONTROL = 'button, a[href], input, select, textarea, [role="button"], [role="menuitem"], [role="checkbox"], [role="switch"]';
/** True when the event comes from a control inside the row rather than from the row itself. */
const fromInnerControl = (event: React.SyntheticEvent<HTMLTableRowElement>) => {
  const control = (event.target as Element).closest?.(INNER_CONTROL);
  return Boolean(control && control !== event.currentTarget && event.currentTarget.contains(control));
};

const emptyValue = (value: SortValue) => value === null || value === undefined || value === '' || (typeof value === 'number' && Number.isNaN(value));
const collator = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });

/** MAIR-1129: rows sorted on one column, French collation, empty values last whatever the direction. */
export function sortRows<Row>(rows: Row[], column: Pick<DataTableColumn<Row>, 'key' | 'sortValue'>, direction: SortDirection): Row[] {
  const valueOf = (row: Row): SortValue => (column.sortValue ? column.sortValue(row) : (row as Record<string, SortValue>)[column.key]);
  const sign = direction === 'asc' ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index, value: valueOf(row) }))
    .sort((a, b) => {
      const aEmpty = emptyValue(a.value); const bEmpty = emptyValue(b.value);
      if (aEmpty || bEmpty) return aEmpty === bEmpty ? a.index - b.index : aEmpty ? 1 : -1;
      const left = a.value instanceof Date ? a.value.getTime() : a.value;
      const right = b.value instanceof Date ? b.value.getTime() : b.value;
      const order = typeof left === 'number' && typeof right === 'number' ? left - right
        : typeof left === 'boolean' && typeof right === 'boolean' ? Number(left) - Number(right)
        : collator.compare(String(left), String(right));
      return order === 0 ? a.index - b.index : order * sign;
    })
    .map(entry => entry.row);
}

export function DataTable<Row>({ label, columns, rows, rowKey, state = 'default', stateProps, sort, onSort, sortable = false, sortKey, sortDirection, onSortChange, skeletonRows = 4, onRowClick, rowLabel, rowProps, className = '', style, ...props }: DataTableProps<Row>) {
  const loadingAnnouncement = useMountedAnnouncement(state === 'loading' ? `${label} : chargement…` : undefined);
  // MAIR-1129: the table sorts by itself when asked to (table `sortable`, a controlled key or `onSortChange`).
  const ownSort = sortable || sortKey !== undefined || sortDirection !== undefined || Boolean(onSortChange);
  const [internalSort, setInternalSort] = React.useState<{ key: string; direction: SortDirection } | null>(null);
  const controlled = sortKey !== undefined || sortDirection !== undefined;
  const ownCurrent = controlled ? (sortKey && sortDirection ? { key: sortKey, direction: sortDirection } : null) : internalSort;
  const current = ownSort ? ownCurrent : sort ?? null;
  const isSortable = (column: DataTableColumn<Row>) => (ownSort ? (column.sortable ?? sortable) : Boolean(column.sortable && onSort));
  const toggle = (column: DataTableColumn<Row>) => {
    if (!isSortable(column)) return;
    const direction: SortDirection = current?.key === column.key && current.direction === 'asc' ? 'desc' : 'asc';
    if (!ownSort) { onSort?.(column.key, direction); return; }
    if (!controlled) setInternalSort({ key: column.key, direction });
    onSortChange?.(column.key, direction);
  };
  const sortedColumn = ownSort && current ? columns.find(column => column.key === current.key) : undefined;
  const shownRows = sortedColumn && current ? sortRows(rows, sortedColumn, current.direction) : rows;
  const empty = state === 'empty' || (state === 'default' && rows.length === 0);
  return (
    <div {...componentMarker('DataTable', props)} className="mairie-data-table w-full overflow-x-auto" data-state={state}>
      <table {...withoutMarker(props)} aria-busy={state === 'loading' || undefined} className={`w-full border-collapse text-left ${className}`.trim()} style={{ fontSize: 'var(--mairie-text-s)', ...style }}>
        <caption className="sr-only">{label}</caption>
        <thead className="bg-[var(--mairie-surface-raised)] text-[var(--mairie-muted)]">
          <tr>
            {columns.map(column => {
              const active = current?.key === column.key ? current.direction : null;
              const canSort = isSortable(column);
              return (
                <th key={column.key} scope="col" aria-sort={column.sortable || (ownSort && canSort) ? (active ? (active === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                  className={`px-4 py-3 font-semibold uppercase tracking-wide ${column.align === 'end' || column.kind === 'actions' ? 'text-right' : ''}`} style={{ width: column.width, fontSize: 'var(--mairie-text-xs)' }}>
                  {canSort ? (
                    // MAIR-1129: none = faint double arrow (35 %, 80 % on hover), asc / desc = arrow in the text colour.
                    <button type="button" onClick={() => toggle(column)} data-sort={active ?? 'none'}
                      className={`group -mx-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 uppercase transition-colors hover:bg-[var(--mairie-surface)] hover:text-[var(--mairie-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] ${active ? 'text-[var(--mairie-text)]' : ''}`.trim()}
                      style={{ borderRadius: 'var(--mairie-radius-s)', transitionDuration: 'var(--mairie-motion-fast)' }}>
                      <span className={column.hideHeader ? 'sr-only' : undefined}>{column.header}</span>
                      <Icon icon={active ? (active === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown} size="xs" className={active ? '' : 'opacity-35 transition-opacity group-hover:opacity-80'} />
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
          {state === 'default' && shownRows.map(row => {
            const extra = rowProps?.(row);
            const interactive = Boolean(onRowClick);
            return (
              <tr key={rowKey(row)} {...extra}
                tabIndex={interactive ? 0 : extra?.tabIndex}
                aria-label={interactive && rowLabel ? rowLabel(row) : extra?.['aria-label']}
                data-interactive={interactive || undefined}
                onClick={interactive ? event => { extra?.onClick?.(event); if (!fromInnerControl(event)) onRowClick!(row); } : extra?.onClick}
                onKeyDown={interactive ? event => {
                  extra?.onKeyDown?.(event);
                  if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
                  event.preventDefault(); onRowClick!(row);
                } : extra?.onKeyDown}
                className={interactive ? `cursor-pointer outline-none hover:bg-[var(--mairie-surface-raised)] focus-visible:bg-[var(--mairie-surface-raised)] focus-visible:shadow-[inset_3px_0_0_var(--mairie-accent)] ${extra?.className ?? ''}`.trim() : extra?.className}>
                {columns.map(column => {
                  const end = column.align === 'end' || column.kind === 'actions';
                  const content = column.cell ? column.cell(row) : String((row as Record<string, unknown>)[column.key] ?? '');
                  return (
                    <td key={column.key} data-kind={column.kind ?? 'text'} className={`px-4 py-3 align-middle ${end ? 'text-right' : ''} ${column.kind === 'strong' ? 'font-semibold' : ''}`.trim()}>
                      {column.kind === 'actions' ? <div className="inline-flex items-center justify-end gap-1">{content}</div> : content}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {(empty || state === 'error') && (
            <tr><td colSpan={columns.length} className="p-0"><DataState size="s" {...stateProps} state={state === 'error' ? 'error' : 'empty'} /></td></tr>
          )}
        </tbody>
      </table>
      {/* Always mounted, written once mounted (RGAA 7.5); it names the table, not the title of its empty state. */}
      <div role="status" aria-live="polite" className="sr-only">{loadingAnnouncement}</div>
    </div>
  );
}
