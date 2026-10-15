import React from 'react';

import { joinClasses } from './calendar/style';
import type { CardProps } from './calendar/types';

export type { CardProps } from './calendar/types';

export const Card = ({ title, children, className = '', ...props }: CardProps) => (
  <section
    className={joinClasses(
      'rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)] shadow-none',
      className
    )}
    {...props}
  >
    {title && <h2 className="px-6 pt-5 text-base font-semibold leading-6 text-[var(--mairie-text)]">{title}</h2>}
    {children}
  </section>
);
