import React from "react";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
});

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div data-slot="dropdown-menu" className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

function DropdownMenuTrigger({ children, asChild, ...props }: DropdownMenuTriggerProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpen(!open);
    props.onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      "data-slot": "dropdown-menu-trigger",
    });
  }

  return (
    <button
      data-slot="dropdown-menu-trigger"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

function DropdownMenuContent({
  className = "",
  sideOffset = 4,
  align = "start",
  side = "bottom",
  children,
  ...props
}: DropdownMenuContentProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
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
      data-slot="dropdown-menu-content"
      className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-[#e3e0dc] bg-white p-1 shadow-md text-black"
      style={{
        top: side === "bottom" ? `calc(100% + ${sideOffset}px)` : undefined,
        bottom: side === "top" ? `calc(100% + ${sideOffset}px)` : undefined,
        left: align === "start" ? 0 : align === "center" ? "50%" : undefined,
        right: align === "end" ? 0 : undefined,
        transform: align === "center" ? "translateX(-50%)" : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

function DropdownMenuItem({
  className = "",
  inset,
  variant = "default",
  disabled,
  onClick,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    onClick?.(e);
    setOpen(false);
  };

  const isDeleteItem = typeof children === "string" && children.includes("Supprimer");

  return (
    <>
      {isDeleteItem && (
        <div className="-mx-1 my-1 h-px bg-gray-200" />
      )}
      <div
        data-slot="dropdown-menu-item"
        data-inset={inset}
        data-variant={variant}
        className={`relative flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-sm outline-none select-none text-black ${
          disabled 
            ? "pointer-events-none opacity-50" 
            : isDeleteItem 
              ? "hover:bg-red-200" 
              : "hover:bg-gray-100"
        } ${variant === "destructive" ? "text-red-600" : ""} ${
          inset ? "pl-8" : ""
        } ${isDeleteItem ? "text-red-600" : ""}`}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

function DropdownMenuLabel({
  className = "",
  inset,
  children,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={`px-2 py-1.5 text-sm font-medium ${inset ? "pl-8" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

function DropdownMenuSeparator({
  className = "",
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={`-mx-1 my-1 h-px bg-gray-200 ${className}`}
      {...props}
    />
  );
}

interface DropdownMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

function DropdownMenuGroup({ children, ...props }: DropdownMenuGroupProps) {
  return (
    <div data-slot="dropdown-menu-group" {...props}>
      {children}
    </div>
  );
}

interface DropdownMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

function DropdownMenuShortcut({
  className = "",
  ...props
}: DropdownMenuShortcutProps) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={`ml-auto text-xs tracking-widest text-black ${className}`}
      {...props}
    />
  );
}

interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  disabled?: boolean;
}

function DropdownMenuCheckboxItem({
  className = "",
  children,
  checked,
  disabled,
  onClick,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <div
      data-slot="dropdown-menu-checkbox-item"
      className={`relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none ${
        disabled ? "pointer-events-none opacity-50" : "hover:bg-gray-100"
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && (
          <svg
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
        )}
      </span>
      {children}
    </div>
  );
}

interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const DropdownMenuRadioContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

function DropdownMenuRadioGroup({
  value,
  onValueChange,
  children,
  ...props
}: DropdownMenuRadioGroupProps) {
  return (
    <DropdownMenuRadioContext.Provider value={{ value, onValueChange }}>
      <div data-slot="dropdown-menu-radio-group" {...props}>
        {children}
      </div>
    </DropdownMenuRadioContext.Provider>
  );
}

interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

function DropdownMenuRadioItem({
  className = "",
  children,
  value,
  disabled,
  ...props
}: DropdownMenuRadioItemProps) {
  const { value: selectedValue, onValueChange } = React.useContext(DropdownMenuRadioContext);
  const isSelected = value === selectedValue;

  const handleClick = () => {
    if (!disabled) {
      onValueChange?.(value);
    }
  };

  return (
    <div
      data-slot="dropdown-menu-radio-item"
      className={`relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none ${
        disabled ? "pointer-events-none opacity-50" : "hover:bg-gray-100"
      } ${className}`}
      onClick={handleClick}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {isSelected && (
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="4" cy="4" r="4" />
          </svg>
        )}
      </span>
      {children}
    </div>
  );
}

interface DropdownMenuSubProps {
  children: React.ReactNode;
}

function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  return <div data-slot="dropdown-menu-sub">{children}</div>;
}

interface DropdownMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  disabled?: boolean;
}

function DropdownMenuSubTrigger({
  className = "",
  inset,
  disabled,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <div
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={`flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none ${
        disabled ? "pointer-events-none opacity-50" : "hover:bg-gray-100"
      } ${inset ? "pl-8" : ""} ${className}`}
      {...props}
    >
      {children}
      <svg
        className="ml-auto size-4"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 12L10 8L6 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

interface DropdownMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function DropdownMenuSubContent({
  className = "",
  children,
  ...props
}: DropdownMenuSubContentProps) {
  return (
    <div
      data-slot="dropdown-menu-sub-content"
      className={`z-50 min-w-[8rem] overflow-hidden rounded-md border border-[#e3e0dc] bg-white p-1 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
