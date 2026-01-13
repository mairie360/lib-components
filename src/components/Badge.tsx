import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

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
    default: 'bg-gray-200 text-gray-800',
    primary: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
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