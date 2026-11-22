'use client';

import React from 'react';

import { Button } from '../../../Button';
import { Text } from '../../../Text';

export interface RangeFooterProps {
  /** The period chosen so far, in words (« 3 – 9 déc. 2026 »); empty while no day is chosen. */
  summary: string;
  /** What is left to do or the number of days (« choisissez la date de fin », « 7 jours »). */
  detail: string;
  canApply: boolean;
  canClear: boolean;
  onClear: () => void;
  onApply: () => void;
}

/** Summary and actions under the calendar of DateRangePicker (MAIR-1099): announced politely, Effacer / Appliquer. */
export function RangeFooter({ summary, detail, canApply, canClear, onClear, onApply }: RangeFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between border-t border-[var(--mairie-border)]" style={{ gap: 10, marginTop: 10, paddingTop: 10 }}>
      <Text as="span" size="s" tone="muted" aria-live="polite" data-range-summary="true">
        {summary ? <><Text as="strong" size="s" weight="semibold">{summary}</Text> · </> : null}
        {detail}
      </Text>
      <span className="flex" style={{ gap: 8 }}>
        <Button label="Effacer" variant="ghost" tone="neutral" size="s" disabled={!canClear} onClick={onClear} />
        <Button label="Appliquer" size="s" disabled={!canApply} onClick={onApply} />
      </span>
    </div>
  );
}
