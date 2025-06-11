import React from 'react';

export interface SpinnerProps {
  /** Size of the spinner */
  size?: string;
  /** Color of the spinner */
  color?: string;
  /** Border thickness of the spinner */
  border?: string;
}

export const Spinner = ({
  size = 'w-6 h-6',
  color = 'text-blue-500',
  border = 'border-4',
}: SpinnerProps) => {
  return (
    <div
      className={`animate-spin rounded-full ${border} border-current border-t-transparent ${size} ${color}`}
      role="status"
    />
  );
};
