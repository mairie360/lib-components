'use client';

import React from 'react';

import { AvatarStack, type AvatarStackPerson } from '../AvatarStack';
import { componentMarker } from '../component-marker';

export type AvatarGroupSize = 's' | 'm';
export interface AvatarGroupProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'onClick'> {
  /** The people shown (photo, else initials of the name). */
  people: AvatarStackPerson[];
  /** Avatars shown before the overflow; 3 by default. */
  max?: number;
  /** Total shown after the avatars (« 6 »), e.g. when `people` is only a sample. Without it the stack shows « +n ». */
  count?: number;
  size?: AvatarGroupSize;
  /** The group is a button (opens the member management). */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** The group is a link to the member management. */
  href?: string;
  /** Accessible name; default « 6 membres » (static) or « 6 membres, gérer les membres » (button or link). */
  label?: string;
}

const membersOf = (total: number) => `${total} ${total > 1 ? 'membres' : 'membre'}`;

/**
 * Members of a group, a project or an event (MAIR-1153, Figma `AvatarGroup`): overlapping avatars (−8 px,
 * 2 px surface outline, through AvatarStack) with or without the total. With `onClick` / `href` the whole
 * group is one accessible button or link (« 6 membres, gérer les membres »), its avatars decorative.
 */
export const AvatarGroup = ({ people, max = 3, count, size = 'm', onClick, href, label, className = '', style, ...props }: AvatarGroupProps) => {
  const total = count ?? people.length;
  const interactive = Boolean(onClick || href);
  const name = label ?? (interactive ? `${membersOf(total)}, gérer les membres` : membersOf(total));
  const withCount = count !== undefined;
  // With a total the stack shows only the first avatars; the number replaces its « +n ».
  const stack = <AvatarStack aria-hidden={interactive || undefined} label={name} people={withCount ? people.slice(0, max) : people} max={max} size={size} />;
  const number = withCount ? (
    <span aria-hidden={interactive || undefined} className="font-semibold text-[var(--mairie-muted)]" style={{ fontSize: `var(--mairie-text-${size === 's' ? 'xs' : 's'})` }}>{total}</span>
  ) : null;
  const shared = {
    'data-size': size,
    'data-count': withCount || undefined,
    className: `inline-flex items-center ${interactive ? 'cursor-pointer rounded-full p-1 transition-colors hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]' : ''} ${className}`.replace(/\s+/g, ' ').trim(),
    style: { gap: 'var(--mairie-space-s)', ...(interactive ? { transitionDuration: 'var(--mairie-motion-fast)' } : {}), ...style },
  };
  if (href) return <a {...props} {...componentMarker('AvatarGroup', props)} {...shared} href={href} aria-label={name} onClick={onClick}>{stack}{number}</a>;
  if (onClick) return <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} {...componentMarker('AvatarGroup', props)} {...shared} type="button" aria-label={name} onClick={onClick}>{stack}{number}</button>;
  return <div {...props} {...componentMarker('AvatarGroup', props)} {...shared}>{stack}{number}</div>;
};
