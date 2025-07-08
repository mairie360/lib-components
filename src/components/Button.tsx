import React from 'react';

export interface ButtonProps {
  /** Is this the principal call to action on the page? */
  primary?: boolean;
  /** What background color to use */
  backgroundColor?: string;
  /** How large should the button be? */
  size?: 'btn-sm' | 'btn-md' | 'btn-lg';
  /** Button contents */
  label: string;
  /** Optional click handler */
  onClick?: () => void;
}

export const Button = ({
  primary = false,
  size = 'btn-md',
  backgroundColor,
  label,
  onClick,
  ...props
}: ButtonProps) => {
  const mode = primary ? 'btn-primary' : 'btn-secondary';

  return (
    <button
      type="button"
      className={`btn ${mode} ${size}`}
      style={{ backgroundColor }}
      onClick={onClick}
      {...props}
    >
      {label}
    </button>
  );
};
