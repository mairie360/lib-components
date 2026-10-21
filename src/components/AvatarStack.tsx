'use client';

import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';
import { Avatar } from './Avatar';

export type AvatarStackSize = Extract<Size, 's' | 'm' | 'l'>;
export interface AvatarStackPerson { name: string; src?: string }
export interface AvatarStackProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  /** Accessible name, e.g. « Membres du projet ». */
  label: string;
  people: AvatarStackPerson[];
  /** Avatars shown before the « +n » counter. */
  max?: number;
  size?: AvatarStackSize;
}

/** Overlapping avatars with « +n » (MAIR-608, Figma `Base/AvatarStack`). Every person stays in the list for assistive technology. */
export const AvatarStack = ({ label, people, max = 4, size = 'm', className = '', ...props }: AvatarStackProps) => {
  const shown = people.slice(0, max); const hidden = people.length - shown.length;
  return (
    <ul {...props} aria-label={label} data-size={size} className={`flex items-center ${className}`.trim()}>
      {shown.map((person, index) => (
        <li key={`${person.name}-${index}`} className={index > 0 ? '-ml-2' : undefined} style={{ zIndex: shown.length - index }}>
          <Avatar src={person.src} alt={person.name} size={size} className="ring-2 ring-[var(--mairie-surface)]" />
        </li>
      ))}
      {hidden > 0 && (
        <li className="-ml-2 flex items-center justify-center rounded-full bg-[var(--mairie-surface-raised)] font-semibold text-[var(--mairie-text)] ring-2 ring-[var(--mairie-surface)]" style={{ width: `var(--mairie-avatar-${size})`, height: `var(--mairie-avatar-${size})`, fontSize: 'var(--mairie-text-xs)' }}
          aria-label={`${hidden} ${hidden > 1 ? 'autres personnes' : 'autre personne'} : ${people.slice(max).map(person => person.name).join(', ')}`}>
          <span aria-hidden="true">+{hidden}</span>
        </li>
      )}
    </ul>
  );
};
