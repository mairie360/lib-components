import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** What background color to use */
  backgroundColor?: string;
  /** How large should the button be? */
  size?: 'btn-sm' | 'btn-md' | 'btn-lg';
  /** Whether to use the primary or secondary DaisyUI variant */
  primary?: boolean;
  /** Button contents */
  label: string;
}

export const Button = ({
  size = 'btn-md',
  backgroundColor,
  label,
  primary,
  className = '',
  style,
  type = 'button',
  ...props
}: ButtonProps) => {
  const variantClass = primary === undefined ? '' : primary ? 'btn-primary' : 'btn-secondary';

  return (
    <button
      type={type}
      className={`btn ${size} ${variantClass} ${className}`.trim()}
      style={backgroundColor ? { ...style, backgroundColor } : style}
      {...props}
    >
      {label}
    </button>
  );
};
