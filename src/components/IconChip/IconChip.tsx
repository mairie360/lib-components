'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

import { Icon } from '../Icon';
import { componentMarker } from '../component-marker';

/** The module identity colours of the theme (`--mairie-module-*`). */
export const iconChipModules = ['dashboard', 'projects', 'calendar', 'messaging', 'workflows', 'training'] as const;
export type IconChipModule = (typeof iconChipModules)[number];
export type IconChipTone = 'neutral' | 'module';
export type IconChipSize = 's' | 'm' | 'l';
/** A module name, or any theme token (`var(--mairie-warning-text)`) for an exceptional chip. */
export type IconChipColor = IconChipModule | `var(--mairie-${string})`;

export interface IconChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'color'> {
  icon: LucideIcon;
  /** `neutral` (default): accent icon on the accent surface. `module`: the module colour behind an `--mairie-on-module` icon. */
  tone?: IconChipTone;
  /** s = 28 px (radius m, 16 px icon: the artifacts' metric chips, MAIR-1260), m = 36 px (radius m), l = 40 px (radius l). */
  size?: IconChipSize;
  /** Background of a `module` chip; `dashboard` by default. Ignored by the neutral tone. */
  color?: IconChipColor;
}

const boxes: Record<IconChipSize, { side: number; radius: string }> = {
  s: { side: 28, radius: 'var(--mairie-radius-m)' },
  m: { side: 36, radius: 'var(--mairie-radius-m)' },
  l: { side: 40, radius: 'var(--mairie-radius-l)' },
};

/** CSS value of a chip colour: a module name becomes its `--mairie-module-*` token. */
export function iconChipColor(color: IconChipColor = 'dashboard'): string {
  return color.startsWith('var(') ? color : `var(--mairie-module-${color})`;
}

/**
 * Decorative icon chip in front of a panel title, a setting or a metric (MAIR-1108, Figma `Base/IconChip`).
 * Always `aria-hidden`: the text next to it carries the meaning.
 */
export const IconChip = ({ icon, tone = 'neutral', size = 'm', color, className = '', style, ...props }: IconChipProps) => {
  const box = boxes[size];
  const colours: React.CSSProperties = tone === 'module'
    ? { background: iconChipColor(color), color: 'var(--mairie-on-module)', borderColor: 'transparent' }
    : { background: 'var(--mairie-accent-surface)', color: 'var(--mairie-accent)', borderColor: 'var(--mairie-border)' };
  return (
    <span
      {...props}
      {...componentMarker('IconChip', props)}
      aria-hidden="true"
      data-tone={tone}
      data-size={size}
      className={`inline-grid shrink-0 place-items-center border ${className}`.trim()}
      style={{ width: box.side, height: box.side, borderRadius: box.radius, ...colours, ...style }}
    >
      <Icon icon={icon} size={size === 's' ? 's' : 'm'} />
    </span>
  );
};
