import React from 'react';
import { Check, ChevronDown, Search, Users, X } from 'lucide-react';

import { joinClasses } from './calendar/style';
import type { CalendarAssignee, CalendarAssigneeId, EventAssigneeSelectProps } from './calendar/types';

export type { CalendarAssignee, CalendarAssigneeId, EventAssigneeSelectProps } from './calendar/types';

const idsMatch = (firstId: CalendarAssigneeId, secondId: CalendarAssigneeId) =>
  String(firstId) === String(secondId);

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const getSelectedPeople = (people: CalendarAssignee[], value: CalendarAssigneeId[] = []) =>
  value
    .map((id) => people.find((person) => idsMatch(person.id, id)))
    .filter((person): person is CalendarAssignee => Boolean(person));

export const EventAssigneeSelect = ({
  people = [],
  value = [],
  onChange,
  label = 'Personnes assignées',
  placeholder = 'Sélectionner des personnes',
  searchPlaceholder = 'Rechercher une personne...',
  emptyLabel = 'Aucune personne disponible',
  disabled = false,
  className = '',
  ...props
}: EventAssigneeSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selectedPeople = getSelectedPeople(people, value);
  const filteredPeople = people.filter((person) => {
    const haystack = `${person.name} ${person.email || ''} ${person.role || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  React.useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
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

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const togglePerson = (person: CalendarAssignee) => {
    const isSelected = value.some((id) => idsMatch(id, person.id));
    const nextValue = isSelected
      ? value.filter((id) => !idsMatch(id, person.id))
      : [...value, person.id];

    onChange?.(nextValue);
  };

  const removePerson = (person: CalendarAssignee) => {
    onChange?.(value.filter((id) => !idsMatch(id, person.id)));
  };

  return (
    <div ref={rootRef} className={joinClasses('relative', className)} {...props}>
      <label className="mb-1 block text-sm font-semibold text-[#334155]">{label}</label>

      <button
        type="button"
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-left text-sm text-[#172033] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/20 disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Users className="h-4 w-4 shrink-0 text-[#64748b]" strokeWidth={1.8} />
          <span className={joinClasses('truncate', selectedPeople.length === 0 && 'text-[#64748b]')}>
            {selectedPeople.length > 0
              ? `${selectedPeople.length} personne${selectedPeople.length > 1 ? 's' : ''} sélectionnée${
                  selectedPeople.length > 1 ? 's' : ''
                }`
              : placeholder}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#64748b]" strokeWidth={1.8} />
      </button>

      {selectedPeople.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedPeople.map((person) => (
            <span
              key={person.id}
              className="inline-flex max-w-full items-center gap-1 rounded-md bg-[#eaf7ee] px-2 py-1 text-xs font-semibold text-[#257444]"
            >
              <span className="truncate">{person.name}</span>
              <button
                type="button"
                aria-label={`Retirer ${person.name}`}
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm hover:bg-[#2faa55]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2faa55]/35"
                onClick={() => removePerson(person)}
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-[#cbd5e1] bg-white shadow-lg">
          <div className="relative border-b border-[#e2e8f0] p-2">
            <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" strokeWidth={1.8} />
            <input
              type="search"
              value={search}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] pl-9 pr-3 text-sm text-[#172033] shadow-sm outline-none placeholder:text-[#64748b] focus:border-[#94a3b8] focus:ring-2 focus:ring-[#3b82f6]/20"
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div role="listbox" aria-multiselectable="true" className="max-h-56 overflow-y-auto p-1">
            {filteredPeople.length > 0 ? (
              filteredPeople.map((person) => {
                const selected = value.some((id) => idsMatch(id, person.id));

                return (
                  <button
                    key={person.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm text-[#172033] hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/20"
                    onClick={() => togglePerson(person)}
                  >
                    {person.avatarUrl ? (
                      <img
                        src={person.avatarUrl}
                        alt=""
                        className="h-7 w-7 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#2563eb] text-[11px] font-semibold text-white">
                        {getInitials(person.name)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{person.name}</span>
                      {(person.role || person.email) && (
                        <span className="block truncate text-xs text-[#64748b]">{person.role || person.email}</span>
                      )}
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-[#2faa55]" strokeWidth={2} />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-[#64748b]">{emptyLabel}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
