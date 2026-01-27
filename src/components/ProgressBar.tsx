import React from "react";

export interface ProgressProps {
  /** Additional CSS classes to apply to the progress container */
  className?: string;
  /** Progress value between 0 and 100 */
  value?: number;
}

function ProgressBar({
  className = "",
  value = 0,
  ...props
}: ProgressProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">Progression</span>
        <span className="text-sm font-medium text-gray-600">{value}%</span>
      </div>
      <div
        data-slot="progress"
        className={`relative h-2 w-full overflow-hidden rounded-full ${className}`}
        style={{ backgroundColor: "#cfdbed" }}
        {...props}
      >
        <div
          data-slot="progress-indicator"
          className="h-full w-full flex-1 transition-all"
          style={{ 
            transform: `translateX(-${100 - value}%)`,
            backgroundColor: "#1256a6"
          }}
        />
      </div>
    </div>
  );
}

export { ProgressBar };
