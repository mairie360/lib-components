'use client';

import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';
import { Avatar } from '../Avatar';
import { Caption, Text } from '../Text';

export type UserIdentityVariant = 'full' | 'nameOnly' | 'photo';
export interface UserIdentityProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  name: string;
  email?: string;
  avatarSrc?: string;
  size?: Size;
  /** full = avatar + name + e-mail, nameOnly = avatar + name, photo = avatar only (name as accessible label). */
  variant?: UserIdentityVariant;
}
const nameSize: Record<Size, Size> = { xs: 'xs', s: 's', m: 's', l: 'm', xl: 'l' };

/** One way to show a person everywhere: avatar + name + e-mail (MAIR-608, Figma `Base/UserIdentity`). */
export const UserIdentity = ({ name, email, avatarSrc, size = 'm', variant = 'full', className = '', ...props }: UserIdentityProps) => (
  <div {...props} data-size={size} data-variant={variant} className={`inline-flex min-w-0 items-center gap-2 ${className}`.trim()} title={variant === 'photo' ? name : props.title}>
    <Avatar src={avatarSrc} alt={name} size={size} />
    {variant !== 'photo' && (
      <span className="flex min-w-0 flex-col">
        <Text size={nameSize[size]} weight="medium" truncate>{name}</Text>
        {variant === 'full' && email && <Caption truncate>{email}</Caption>}
      </span>
    )}
  </div>
);
