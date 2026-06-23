import React from 'react';

import { joinClasses } from './calendar/style';
import type { MessagingPresence } from './messaging/types';

export interface MessagingContactAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  initials?: string;
  presence?: MessagingPresence;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'size-9 text-sm',
  md: 'size-11 text-base',
  lg: 'size-12 text-base',
};

const presenceClasses: Record<MessagingPresence, string> = {
  online: 'bg-[#4b908d]',
  away: 'bg-[#f4b000]',
  offline: 'bg-[#a3a9b0]',
};

const getInitials = (name: string, initials?: string) => {
  if (initials) return initials;

  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export const MessagingContactAvatar = ({
  name,
  src,
  initials,
  presence,
  size = 'md',
  className = '',
  ...props
}: MessagingContactAvatarProps) => (
  <div className={joinClasses('relative shrink-0', className)} {...props}>
    <div
      className={joinClasses(
        'flex items-center justify-center overflow-hidden rounded-full bg-[#1256a6] font-semibold leading-none text-white ring-2 ring-white',
        sizeClasses[size]
      )}
    >
      {src ? (
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span>{getInitials(name, initials)}</span>
      )}
    </div>
    {presence && (
      <span
        aria-label={presence === 'online' ? 'En ligne' : presence === 'away' ? 'Absent' : 'Hors ligne'}
        className={joinClasses(
          'absolute bottom-0 right-0 block size-3 rounded-full border-2 border-white',
          presenceClasses[presence]
        )}
      />
    )}
  </div>
);
