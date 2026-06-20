import React from "react";

export interface AvatarProps {
  /** Classes CSS supplémentaires à appliquer au conteneur de l’avatar */
  className?: string;
  /** URL source de l’image d’avatar */
  src?: string;
  /** Texte alternatif de l’image d’avatar */
  alt?: string;
  /** Contenu de remplacement lorsque l’image ne charge pas */
  fallback?: React.ReactNode;
}

function Avatar({ 
  className = "", 
  src, 
  alt = "", 
  fallback,
  ...props 
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      data-slot="avatar"
      className={`relative flex size-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    >
      {src && !imageError ? (
        <img
          data-slot="avatar-image"
          src={src}
          alt={alt}
          className="aspect-square size-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          data-slot="avatar-fallback"
          className="flex size-full items-center justify-center rounded-full"
          style={{ backgroundColor: "#1256a6" }}
        >
          {fallback}
        </div>
      )}
    </div>
  );
}

export { Avatar };
