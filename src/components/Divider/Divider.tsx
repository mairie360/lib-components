'use client';

import React from 'react';

import { componentMarker } from '../component-marker';

export interface DividerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Text in the middle of the line (« ou »); without it the divider is a plain line. */
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Separator (MAIR-1072, Figma `Base/Divider`): a plain line (`<hr>` when horizontal) or a line with a
 * centred label such as « ou » (`role="separator"`, the label is its accessible name). It replaces the
 * « ou » line that was local to the Login front.
 */
export function Divider({ label, orientation = 'horizontal', className = '', style, ...props }: DividerProps) {
  const vertical = orientation === 'vertical';
  if (!vertical && !label) {
    return <hr {...(props as React.HTMLAttributes<HTMLHRElement>)} {...componentMarker('Divider', props)} data-orientation="horizontal" className={`m-0 h-px w-full border-0 bg-[var(--mairie-border)] ${className}`.trim()} style={style} />;
  }
  if (vertical) {
    return <div {...props} {...componentMarker('Divider', props)} role="separator" aria-orientation="vertical" aria-label={label} data-orientation="vertical" className={`w-px self-stretch bg-[var(--mairie-border)] ${className}`.trim()} style={style} />;
  }
  return (
    <div {...props} {...componentMarker('Divider', props)} role="separator" aria-orientation="horizontal" aria-label={label} data-orientation="horizontal" className={`flex w-full items-center text-[var(--mairie-muted)] ${className}`.trim()} style={{ gap: 'var(--mairie-space-m)', fontSize: 'var(--mairie-text-s)', ...style }}>
      <span aria-hidden="true" className="h-px flex-1 bg-[var(--mairie-border)]" />
      <span aria-hidden="true">{label}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-[var(--mairie-border)]" />
    </div>
  );
}
