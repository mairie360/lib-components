import React from "react";

export interface AvatarProps {
  /** Additional CSS classes to apply to the avatar container */
  className?: string;
  /** Source URL of the avatar image */
  src?: string;
  /** Alt text for the avatar image */
  alt?: string;
  /** Fallback content to display when the image fails to load */
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
