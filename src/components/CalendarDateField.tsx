import React from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import { defaultDayLabels } from './calendar/constants';
import {
  addMonths,
  formatDateForServer,
  formatFullDate,
  formatMonthYear,
  getMonthCells,
  isSameDay,
  normalizeDateForServer,
  parseDateInput,
  serverDatePattern,
} from './calendar/date';
import { joinClasses } from './calendar/style';
import type { CalendarDateInput } from './calendar/types';

export interface CalendarDateFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  id: string;
  label: React.ReactNode;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  inputClassName?: string;
  labelClassName?: string;
  onChange: (value: string) => void;
}

const getValidDate = (value?: CalendarDateInput | null) => {
  if (!value) return null;

  const parsedDate = parseDateInput(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getDisplayValue = (value?: string) => {
  if (!value) return '';

  const normalizedValue = value.trim().replace(/\//g, '-');
  const parsedDate = getValidDate(normalizedValue);

  return parsedDate && normalizedValue.length >= 8 ? formatDateForServer(parsedDate) : normalizedValue;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const CalendarDateField = ({
  id,
  label,
  value = '',
  required = false,
  disabled = false,
  inputClassName = '',
  labelClassName = '',
  onChange,
  className = '',
  ...props
}: CalendarDateFieldProps) => {
  const selectedDate = getValidDate(value);
  const [open, setOpen] = React.useState(false);
  const [displayMonth, setDisplayMonth] = React.useState<Date>(() => selectedDate || new Date());
  const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const labelText = typeof label === 'string' ? label : 'la date';
  const popoverWidth = 292;

  const updatePopoverPosition = React.useCallback(() => {
    if (!rootRef.current || typeof window === 'undefined') return;

    const fieldRect = rootRef.current.getBoundingClientRect();
    const viewportPadding = 12;
    const gap = 6;
    const popoverHeight = popoverRef.current?.offsetHeight || 336;
    const availableBelow = window.innerHeight - fieldRect.bottom - viewportPadding;
    const availableAbove = fieldRect.top - viewportPadding;
    const placeAbove = availableBelow < popoverHeight && availableAbove > availableBelow;
    const left = clamp(fieldRect.left, viewportPadding, window.innerWidth - popoverWidth - viewportPadding);
    const top = placeAbove
      ? Math.max(viewportPadding, fieldRect.top - popoverHeight - gap)
      : Math.min(fieldRect.bottom + gap, window.innerHeight - viewportPadding - popoverHeight);

    setPopoverStyle({
      left,
      top,
      width: popoverWidth,
    });
  }, []);

  React.useEffect(() => {
    if (open) {
      setDisplayMonth(selectedDate || new Date());
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(updatePopoverPosition);
      } else {
        updatePopoverPosition();
      }
    }
  }, [open, selectedDate?.getTime(), updatePopoverPosition]);

  React.useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickInsideRoot = Boolean(rootRef.current?.contains(target));
      const clickInsidePopover = Boolean(popoverRef.current?.contains(target));

      if (!clickInsideRoot && !clickInsidePopover) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
    };
  }, [open, updatePopoverPosition]);

  const monthCells = getMonthCells(displayMonth);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value.replace(/\//g, '-'));
  };

  const handleSelectDate = (date: Date) => {
    onChange(normalizeDateForServer(date));
    setOpen(false);
  };

  const popover =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[80] rounded-md border border-[#cbd5e1] bg-white p-3 text-[#172033] shadow-xl"
            style={popoverStyle}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Mois précédent"
                className="inline-flex size-8 items-center justify-center rounded-md border border-[#d8d2ca] bg-[#fbfaf9] transition hover:bg-[#f3f0ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/25"
                onClick={() => setDisplayMonth((currentMonth) => addMonths(currentMonth, -1))}
              >
                <ChevronLeft className="size-4" strokeWidth={1.8} />
              </button>
              <div className="min-w-0 text-sm font-semibold text-[#172033]">{formatMonthYear(displayMonth)}</div>
              <button
                type="button"
                aria-label="Mois suivant"
                className="inline-flex size-8 items-center justify-center rounded-md border border-[#d8d2ca] bg-[#fbfaf9] transition hover:bg-[#f3f0ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/25"
                onClick={() => setDisplayMonth((currentMonth) => addMonths(currentMonth, 1))}
              >
                <ChevronRight className="size-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-[#64748b]">
              {defaultDayLabels.map((dayLabel) => (
                <div key={dayLabel}>{dayLabel}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {monthCells.map((date, index) =>
                date ? (
                  <button
                    key={formatDateForServer(date)}
                    type="button"
                    aria-label={`Choisir le ${formatFullDate(date)}`}
                    className={joinClasses(
                      'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/25',
                      selectedDate && isSameDay(selectedDate, date)
                        ? 'bg-[#1256a6] text-white hover:bg-[#0f4a8d]'
                        : 'text-[#172033] hover:bg-[#f5f3f0]'
                    )}
                    onClick={() => handleSelectDate(date)}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <span key={`empty-${index}`} aria-hidden="true" className="size-8" />
                )
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className={joinClasses('relative', className)} {...props}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          pattern={serverDatePattern}
          required={required}
          disabled={disabled}
          value={getDisplayValue(value)}
          placeholder="dd-mm-yyyy"
          title="Format attendu : dd-mm-yyyy"
          className={joinClasses(inputClassName, 'pr-11')}
          onChange={handleInputChange}
        />
        <button
          type="button"
          aria-label={`Ouvrir le calendrier pour ${labelText}`}
          disabled={disabled}
          className="absolute right-1 top-1 inline-flex size-7 items-center justify-center rounded-md text-[#64748b] transition hover:bg-white hover:text-[#1256a6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/25 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => setOpen((currentOpen) => !currentOpen)}
        >
          <CalendarDays className="size-4" strokeWidth={1.8} />
        </button>
      </div>

      {popover}
    </div>
  );
};
