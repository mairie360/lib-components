'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from '../Icon';
import { IconChip, type IconChipColor, type IconChipTone } from '../IconChip';
import { Metric, Overline, Caption, BodySmall } from '../Text';
import { Skeleton } from '../Skeleton';
import { componentMarker } from '../component-marker';

export type MetricSize = Extract<Size, 's' | 'm' | 'l'>;
export type MetricLayout = 'stacked' | 'inline';
export interface MetricCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'onClick'> {
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
  /**
   * MAIR-1117: `stacked` (default) = label, value and trend with the icon on the right; `inline` = IconChip l,
   * then the value over the label, no trend (compact cards in a row of four).
   */
  layout?: MetricLayout;
  /** MAIR-1117: tone of the inline chip (`neutral` by default). */
  iconTone?: IconChipTone;
  /** MAIR-1117: colour of a `module` inline chip (a module or a theme token, e.g. `var(--mairie-warning-text)`). */
  iconColor?: IconChipColor;
  /** MAIR-1140: the whole card is a link. */
  href?: string;
  /** MAIR-1140: the whole card is a button (a filter, a drawer…). */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** MAIR-1140: selected card (the filter it applies is on); a button card given `active` is a toggle (`aria-pressed`). */
  active?: boolean;
}
const valueSize: Record<MetricSize, Size> = { s: 'l', m: 'xl', l: 'xl' };
const padding: Record<MetricSize, string> = { s: 'var(--mairie-space-s)', m: 'var(--mairie-space-m)', l: 'var(--mairie-space-l)' };

/** Plain text of a value for the default accessible name (« Sessions actives : 3 »). */
function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return '';
}

/**
 * Numeric indicator card: label, icon, value, trend or freshness (MAIR-608, Figma `Base/MetricCard`).
 * MAIR-1117 inline layout; MAIR-1140 clickable card (`href` = link, `onClick` = button, `active`).
 */
export const MetricCard = ({ label, value, icon, size = 'm', trend = 'none', trendLabel, loading = false, layout = 'stacked', iconTone = 'neutral', iconColor, href, onClick, active, className = '', style, ...props }: MetricCardProps) => {
  const trendTone = trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'muted';
  const interactive = Boolean(href || onClick);
  const valueNode = loading ? <Skeleton shape="line" size="l" label="Chargement de l’indicateur" className="w-24" /> : null;
  const content = layout === 'inline' ? (
    <span className="flex min-w-0 items-center" style={{ gap: 14 }}>
      {icon && <IconChip icon={icon} size="l" tone={iconTone} color={iconColor} />}
      <span className="flex min-w-0 flex-col">
        {valueNode ?? <Metric size="xl" className="leading-tight">{value}</Metric>}
        <BodySmall as="span" tone="muted">{label}</BodySmall>
      </span>
    </span>
  ) : (
    <>
      <span className="flex items-center justify-between gap-2">
        <Overline>{label}</Overline>
        {icon && <span className="text-[var(--mairie-accent)]"><Icon icon={icon} size={size} /></span>}
      </span>
      {valueNode ?? <Metric size={valueSize[size]} style={{ fontSize: size === 'l' ? '28px' : undefined }}>{value}</Metric>}
      {trendLabel && (
        <Caption tone={trendTone} className="inline-flex items-center gap-1">
          {trend === 'up' && <Icon icon={TrendingUp} size="xs" />}
          {trend === 'down' && <Icon icon={TrendingDown} size="xs" />}
          {trendLabel}
        </Caption>
      )}
    </>
  );
  const shared = {
    'aria-busy': loading || undefined,
    'data-size': size,
    'data-trend': trend,
    'data-layout': layout,
    'data-active': (interactive && active) || undefined,
    className: `relative flex border text-left ${layout === 'inline' ? 'flex-row items-center' : 'flex-col gap-2'} ${active ? 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)]' : 'border-[var(--mairie-border)] bg-[var(--mairie-surface)]'} ${interactive ? `min-h-11 w-full cursor-pointer no-underline text-[var(--mairie-text)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] ${active ? '' : 'hover:border-[var(--mairie-control-border)]'} hover:shadow-md` : ''} ${className}`.replace(/\s+/g, ' ').trim(),
    style: { padding: layout === 'inline' ? 20 : padding[size], ...(interactive ? { paddingRight: 36 } : {}), borderRadius: 'var(--mairie-radius-l)', ...(interactive ? { transitionDuration: 'var(--mairie-motion-fast)' } : {}), ...style } as React.CSSProperties,
  };
  if (!interactive) {
    return <section {...props} {...componentMarker('MetricCard', props)} aria-label={label} {...shared}>{content}</section>;
  }
  const name = props['aria-label'] ?? (textOf(value) ? `${label} : ${textOf(value)}` : label);
  const chevron = <span aria-hidden="true" className="absolute text-[var(--mairie-muted)]" style={{ right: 12, bottom: 12 }}><Icon icon={ArrowRight} size="s" /></span>;
  if (href) {
    return <a {...props} {...componentMarker('MetricCard', props)} {...shared} aria-label={name} aria-current={active ? 'true' : undefined} href={href} onClick={onClick}>{content}{chevron}</a>;
  }
  return <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} {...componentMarker('MetricCard', props)} {...shared} type="button" aria-label={name} aria-pressed={active === undefined ? undefined : active} onClick={onClick}>{content}{chevron}</button>;
};
