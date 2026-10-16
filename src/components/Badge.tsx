import React from 'react';

export type BadgeVariant = 'default' | 'green' | 'blue' | 'red' | 'dark';

export interface BadgeProps {
  /** Text content of the badge */
  text: string;
  /** Variant style of the badge */
  variant?: BadgeVariant;
  /** Whether the badge is rounded */
  rounded?: boolean;
}

export const Badge = ({
  text,
  variant = 'default',
  rounded = false,
}: BadgeProps) => {
  const variantClasses = {
    default: 'bg-[var(--mairie-surface-raised)] text-[var(--mairie-text)]',
    green: 'bg-[var(--mairie-success-action-background)] text-[var(--mairie-on-action)]',
    blue: 'bg-[var(--mairie-action-background)] text-[var(--mairie-on-action)]',
    red: 'bg-[var(--mairie-error-action-background)] text-[var(--mairie-on-action)]',
    dark: 'bg-[var(--mairie-navigation-background)] text-[var(--mairie-on-action)]',
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-medium ${
        variantClasses[variant]
      } ${rounded ? 'rounded-full' : 'rounded'}`}
    >
      {text}
    </span>
  );
}