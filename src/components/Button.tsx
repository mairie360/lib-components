import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Couleur d’arrière-plan à utiliser */
  backgroundColor?: string;
  /** Taille du bouton */
  size?: 'btn-sm' | 'btn-md' | 'btn-lg';
  /** Utilise la variante principale ou secondaire de DaisyUI */
  primary?: boolean;
  /** Contenu du bouton */
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
