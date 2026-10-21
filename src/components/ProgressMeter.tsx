'use client';

import React, { useId } from 'react';

import type { Size, Tone } from '@mairie360/lib-components/theme';
import { BodySmall, Caption } from './Text';

export type ProgressSize = Extract<Size, 's' | 'm' | 'l'>;
export type ProgressTone = Extract<Tone, 'primary' | 'success' | 'warning' | 'danger'>;
export interface ProgressMeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  label: string;
  /** 0–100; values outside are clamped. */
  value: number;
  size?: ProgressSize;
  tone?: ProgressTone;
  /** Hide the « 64 % » text (the meter still exposes it). */
  showValue?: boolean;
}
const heights: Record<ProgressSize, number> = { s: 4, m: 8, l: 12 };
const fills: Record<ProgressTone, string> = { primary: 'var(--mairie-action-background)', success: 'var(--mairie-success-action-background)', warning: 'var(--mairie-warning-text)', danger: 'var(--mairie-error-action-background)' };

/** Progress bar with label and percentage (MAIR-608, Figma `Base/ProgressMeter`). */
export const ProgressMeter = ({ label, value, size = 'm', tone = 'primary', showValue = true, className = '', ...props }: ProgressMeterProps) => {
  const id = useId();
  const percent = Math.round(Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0)));
  return (
    <div {...props} data-size={size} data-tone={tone} className={`flex flex-col gap-1 ${className}`.trim()}>
      <div className="flex items-baseline justify-between gap-2">
        <BodySmall as="span" id={id} weight="medium">{label}</BodySmall>
        {showValue && <Caption tone="default">{percent} %</Caption>}
      </div>
      <div role="progressbar" aria-labelledby={id} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${percent} %`}
        className="w-full overflow-hidden rounded-full bg-[var(--mairie-surface-raised)]" style={{ height: heights[size] }}>
        <div className="h-full rounded-full transition-[width]" style={{ width: `${percent}%`, background: fills[tone] }} />
      </div>
    </div>
  );
};
