import React from 'react';

export interface ButtonProps {
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
  size = 'btn-md',
  backgroundColor,
  label,
  onClick,
  ...props
}: ButtonProps) => {

  return (
    <button
      type="button"
      className={`btn ${size}`}
      style={backgroundColor ? { backgroundColor } : undefined}
      onClick={onClick}
      {...props}
    >
      {label}
    </button>
  );
};
