import * as React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
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
