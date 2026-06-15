import React from 'react';

import { joinClasses } from './calendar/style';
import type { CardProps } from './calendar/types';

export type { CardProps } from './calendar/types';

export const Card = ({ title, children, className = '', ...props }: CardProps) => (
  <section
    className={joinClasses(
      'rounded-lg border border-[#d8d2ca] bg-white text-[#172033] shadow-none',
      className
    )}
    {...props}
  >
    {title && <h2 className="px-6 pt-5 text-base font-semibold leading-6 text-[#172033]">{title}</h2>}
    {children}
  </section>
);
