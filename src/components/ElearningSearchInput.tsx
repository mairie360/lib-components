import React from 'react';
import { Search } from 'lucide-react';

import { joinClasses } from './calendar/style';

export interface ElearningSearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'onChange' | 'type' | 'value'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const ElearningSearchInput = ({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  placeholder = 'Rechercher une formation...',
  className = '',
  ...props
}: ElearningSearchInputProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = controlledValue ?? internalValue;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (controlledValue === undefined) {
      setInternalValue(event.target.value);
    }

    onValueChange?.(event.target.value);
  };

  return (
    <div className={joinClasses('relative w-full', className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5f6470]"
      />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-[#d8d2ca] bg-white px-10 text-sm text-[#2f3747] outline-none transition focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20"
        {...props}
      />
    </div>
  );
};
