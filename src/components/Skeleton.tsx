import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';

export type SkeletonShape = 'line' | 'block' | 'circle';
export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  shape?: SkeletonShape;
  /** Line height / block height / circle diameter on the shared scale. */
  size?: Size;
  /** Omit for a decorative placeholder; supply localized loading text to announce it. */
  label?: string;
  /** Shimmer, only for users allowing motion. */
  animated?: boolean;
}
const lineHeights: Record<Size, number> = { xs: 8, s: 12, m: 16, l: 20, xl: 28 };
const blockHeights: Record<Size, number> = { xs: 40, s: 64, m: 96, l: 160, xl: 240 };

/** Loading bone with a shimmer (MAIR-608, Figma `Base/Skeleton`). Prefer `Skeleton.TextBlock`, `.Card`, `.TableRow`, `.UserIdentity`. */
function SkeletonBase({ shape = 'line', size = 'm', label, animated = true, className = '', style, ...props }: SkeletonProps) {
  const dimension = shape === 'circle' ? { width: `var(--mairie-avatar-${size})`, height: `var(--mairie-avatar-${size})` } : shape === 'block' ? { height: blockHeights[size] } : { height: lineHeights[size] };
  const visual = <div {...props} aria-hidden="true" data-shape={shape} data-size={size}
    className={`mairie-skeleton ${shape === 'circle' ? 'shrink-0 rounded-full' : 'w-full'} ${animated ? 'mairie-skeleton-animated' : ''} ${className}`.replace(/\s+/g, ' ').trim()}
    style={{ borderRadius: shape === 'circle' ? '9999px' : `var(--mairie-radius-${shape === 'block' ? 'l' : 's'})`, ...dimension, ...style }} />;
  return label ? <div role="status" aria-live="polite"><span className="sr-only">{label}</span>{visual}</div> : visual;
}

type PresetProps = Pick<SkeletonProps, 'label' | 'animated' | 'className'>;
const wrap = (label: string | undefined, children: React.ReactNode, className: string, style?: React.CSSProperties) =>
  label ? <div role="status" aria-live="polite" className={className} style={style}><span className="sr-only">{label}</span>{children}</div> : <div aria-hidden="true" className={className} style={style}>{children}</div>;

/** Three text lines (Figma Skeleton/TextBlock). */
const TextBlock = ({ label, animated, className = '' }: PresetProps) => wrap(label, <>
  <SkeletonBase size="s" animated={animated} />
  <SkeletonBase size="s" animated={animated} className="!w-11/12" />
  <SkeletonBase size="s" animated={animated} className="!w-3/5" />
</>, `flex flex-col gap-2 ${className}`);
/** A card: title line + block (Skeleton/Card). */
const Card = ({ label, animated, className = '' }: PresetProps) => wrap(label, <>
  <SkeletonBase size="m" animated={animated} className="!w-1/2" />
  <SkeletonBase shape="block" size="s" animated={animated} />
</>, `flex flex-col gap-3 rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-4 ${className}`);
/** A table row of `columns` cells (Skeleton/TableRow). */
const TableRow = ({ label, animated, className = '', columns = 4 }: PresetProps & { columns?: number }) => wrap(label, <>
  {Array.from({ length: columns }, (_, index) => <SkeletonBase key={index} size="s" animated={animated} />)}
</>, `grid items-center gap-4 py-3 ${className}`.trim(), { gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))` });
/** Avatar + two lines (Skeleton/UserIdentity). */
const UserIdentity = ({ label, animated, className = '' }: PresetProps) => wrap(label, <>
  <SkeletonBase shape="circle" size="l" animated={animated} />
  <div className="flex flex-1 flex-col gap-2"><SkeletonBase size="s" animated={animated} className="!w-1/2" /><SkeletonBase size="xs" animated={animated} className="!w-1/3" /></div>
</>, `flex items-center gap-3 ${className}`);

export const Skeleton = Object.assign(SkeletonBase, { TextBlock, Card, TableRow, UserIdentity });
