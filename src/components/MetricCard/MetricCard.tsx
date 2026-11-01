'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from '../Icon';
import { Metric, Overline, Caption } from '../Text';
import { Skeleton } from '../Skeleton';

export type MetricSize = Extract<Size, 's' | 'm' | 'l'>;
export interface MetricCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  label: string;
  /** Already formatted value (« 1 284 », « 64 % »). */
  value: React.ReactNode;
  icon?: LucideIcon;
  size?: MetricSize;
  /** Direction of the trend arrow; `none` shows only the trend label (freshness). */
  trend?: 'none' | 'up' | 'down';
  /** « +12 % ce mois », « Mis à jour il y a 5 min »… */
  trendLabel?: string;
  loading?: boolean;
}
const valueSize: Record<MetricSize, Size> = { s: 'l', m: 'xl', l: 'xl' };
const padding: Record<MetricSize, string> = { s: 'var(--mairie-space-s)', m: 'var(--mairie-space-m)', l: 'var(--mairie-space-l)' };

/** Numeric indicator card: label, icon, value, trend or freshness (MAIR-608, Figma `Base/MetricCard`). */
export const MetricCard = ({ label, value, icon, size = 'm', trend = 'none', trendLabel, loading = false, className = '', style, ...props }: MetricCardProps) => {
  const trendTone = trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'muted';
  return (
    <section {...props} aria-label={label} aria-busy={loading || undefined} data-size={size} data-trend={trend}
      className={`flex flex-col gap-2 rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] ${className}`.trim()}
      style={{ padding: padding[size], borderRadius: 'var(--mairie-radius-l)', ...style }}>
      <div className="flex items-center justify-between gap-2">
        <Overline>{label}</Overline>
        {icon && <span className="text-[var(--mairie-accent)]"><Icon icon={icon} size={size} /></span>}
      </div>
      {loading ? <Skeleton shape="line" size="l" label="Chargement de l’indicateur" className="w-24" /> : <Metric size={valueSize[size]} style={{ fontSize: size === 'l' ? '28px' : undefined }}>{value}</Metric>}
      {trendLabel && (
        <Caption tone={trendTone} className="inline-flex items-center gap-1">
          {trend === 'up' && <Icon icon={TrendingUp} size="xs" />}
          {trend === 'down' && <Icon icon={TrendingDown} size="xs" />}
          {trendLabel}
        </Caption>
      )}
    </section>
  );
};
