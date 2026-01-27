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
    default: 'bg-gray-200 text-gray-800',
    green: 'bg-[#4b908d] text-white',
    blue: 'bg-[#1256a6] text-white',
    red: 'bg-[#c63c31] text-white',
    dark: 'bg-[#2d2d2d] text-white',
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