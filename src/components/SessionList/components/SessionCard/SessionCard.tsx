'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

import { Icon } from '../../../Icon';
import { StatusBadge, StatusPill, type Status } from '../../../StatusPill';
import { SessionDate } from '../SessionDate';

export interface SessionCardProps {
  /** Device name (or the readable device the front computed). */
  device: React.ReactNode;
  deviceIcon: LucideIcon;
  current: boolean;
  status: Status;
  statusLabel: string;
  ipAddress: string;
  createdAt: string;
  /** End date and its label (« Expire le », « Expirée le », « Révoquée le », « Fin le »). */
  endAt: string | null | undefined;
  endLabel: string;
  timeZone?: string;
  /** « Déconnecter » button, already labelled with the device. */
  action?: React.ReactNode;
  /** Opens the session detail (MAIR-1000): the device name becomes a button. */
  onSelect?: () => void;
  selectLabel?: string;
}

/** One session on two lines (MAIR-845, Figma `SessionList/Row` Layout=Compact): device and badges, then IP and dates. */
export function SessionCard({ device, deviceIcon, current, status, statusLabel, ipAddress, createdAt, endAt, endLabel, timeZone, action, onSelect, selectLabel }: SessionCardProps) {
  const muted = 'text-[var(--mairie-muted)]';
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 ${onSelect ? 'cursor-pointer hover:bg-[var(--mairie-surface-raised)]' : ''}`} onClick={onSelect}>
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-[var(--mairie-radius-m)] bg-[var(--mairie-surface-raised)] text-[var(--mairie-muted)]"><Icon icon={deviceIcon} size="s" /></span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          {onSelect
            ? <button type="button" aria-label={selectLabel} onClick={event => { event.stopPropagation(); onSelect(); }} className="min-w-0 truncate rounded-sm text-left font-semibold text-[var(--mairie-text)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]">{device}</button>
            : <span className="min-w-0 truncate font-semibold text-[var(--mairie-text)]">{device}</span>}
          {current ? <StatusPill tone="primary" size="s" label="Cet appareil" /> : null}
          <StatusBadge status={status} label={statusLabel} size="s" />
        </div>
        <p className={`flex flex-wrap gap-x-3 ${muted}`} style={{ fontSize: 'var(--mairie-text-xs)' }}>
          <span>{ipAddress}</span>
          <span>Créée le <SessionDate value={createdAt} timeZone={timeZone} /></span>
          <span>{endLabel} <SessionDate value={endAt} timeZone={timeZone} /></span>
        </p>
      </div>
      {action ? <div className="shrink-0" onClick={event => event.stopPropagation()}>{action}</div> : null}
    </div>
  );
}
