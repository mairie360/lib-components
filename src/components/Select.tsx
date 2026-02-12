import React from "react";

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue>({
  open: false,
  setOpen: () => {},
});

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

function Select({ children, value: controlledValue, onValueChange, defaultValue }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const [open, setOpen] = React.useState(false);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [controlledValue, onValueChange]
  );

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <div data-slot="select" className="relative inline-block w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "default";
  placeholder?: string;
}

function SelectTrigger({
  className = "",
  size = "default",
  children,
  placeholder,
  ...props
}: SelectTriggerProps) {
  const { open, setOpen } = React.useContext(SelectContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpen(!open);
    props.onClick?.(e);
  };

  return (
    <button
      data-slot="select-trigger"
      data-size={size}
      type="button"
      className={`flex w-full items-center justify-between gap-2 rounded-md border border-[#e3e0dc] bg-white px-3 py-2 text-sm text-black whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 ${
        size === "default" ? "h-9" : "h-8"
      } ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      <svg
        className="size-4 opacity-50 shrink-0"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = React.useContext(SelectContext);
  const itemsContext = React.useContext(SelectItemsContext);

  const selectedItem = itemsContext.items.find((item) => item.value === value);

  return (
    <span data-slot="select-value" className="flex items-center gap-2 line-clamp-1">
      {selectedItem ? selectedItem.label : placeholder || "Sélectionner..."}
    </span>
  );
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "popper" | "item-aligned";
}

function SelectContent({
  className = "",
  children,
  position = "popper",
  ...props
}: SelectContentProps) {
  const { open, setOpen } = React.useContext(SelectContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      data-slot="select-content"
      className={`absolute z-50 mt-1 max-h-60 min-w-[8rem] w-full overflow-auto rounded-md border border-[#e3e0dc] bg-white shadow-md text-black p-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

interface SelectItemsContextValue {
  items: Array<{ value: string; label: React.ReactNode }>;
  registerItem: (value: string, label: React.ReactNode) => void;
}

const SelectItemsContext = React.createContext<SelectItemsContextValue>({
  items: [],
  registerItem: () => {},
});

function SelectItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Array<{ value: string; label: React.ReactNode }>>([]);

  const registerItem = React.useCallback((value: string, label: React.ReactNode) => {
    setItems((prev) => {
      const exists = prev.find((item) => item.value === value);
      if (exists) return prev;
      return [...prev, { value, label }];
    });
  }, []);

  return (
    <SelectItemsContext.Provider value={{ items, registerItem }}>
      {children}
    </SelectItemsContext.Provider>
  );
}

function SelectItem({ className = "", value, children, ...props }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = React.useContext(SelectContext);
  const { registerItem } = React.useContext(SelectItemsContext);

  React.useEffect(() => {
    registerItem(value, children);
  }, [value, children, registerItem]);

  const isSelected = value === selectedValue;

  const handleClick = () => {
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <div
      data-slot="select-item"
      className={`relative flex w-full cursor-default items-center gap-2 rounded px-2 py-1.5 pr-8 text-sm outline-none select-none hover:bg-gray-100 ${className}`}
      onClick={handleClick}
      {...props}
    >
      {isSelected && (
        <span className="absolute right-2 flex size-3.5 items-center justify-center">
          <svg
            className="size-4"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.3332 4L5.99984 11.3333L2.6665 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
      <span className="flex items-center gap-2">{children}</span>
    </div>
  );
}

interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

function SelectLabel({ className = "", ...props }: SelectLabelProps) {
  return (
    <div
      data-slot="select-label"
      className={`px-2 py-1.5 text-xs text-gray-500 ${className}`}
      {...props}
    />
  );
}

interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

function SelectSeparator({ className = "", ...props }: SelectSeparatorProps) {
  return (
    <div
      data-slot="select-separator"
      className={`-mx-1 my-1 h-px bg-gray-200 pointer-events-none ${className}`}
      {...props}
    />
  );
}

interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

function SelectGroup({ ...props }: SelectGroupProps) {
  return <div data-slot="select-group" {...props} />;
}

function SelectScrollUpButton() {
  return null;
}

function SelectScrollDownButton() {
  return null;
}

function SelectWithProvider(props: SelectProps) {
  return (
    <SelectItemsProvider>
      <Select {...props} />
    </SelectItemsProvider>
  );
}

export {
  SelectWithProvider as Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
