'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

import { Alert } from '../../../Alert';
import { Text, Caption, Overline } from '../../../Text';
import {
  GLOBAL_SEARCH_DEBOUNCE_MS,
  globalSearchDetail,
  globalSearchModuleLabels,
  isGlobalSearchTerm,
  type GlobalSearchItem,
  type GlobalSearchModule,
  type GlobalSearchResult,
  type GlobalSearchResultHref,
  type GlobalSearchSource,
} from './global-search';

export interface HeaderSearchProps {
  /** Accessible name of the field and of the search landmark. */
  label: string;
  placeholder: string;
  /** Controlled value (with `onChange`). */
  value?: string;
  /** Called on every keystroke and with '' when the search is cleared (✕ or Échap). */
  onChange?: (query: string) => void;
  /** The module's own search, run on Entrée (or « Rechercher « q » dans … » when the list is open). */
  onSearch?: (query: string) => void;
  /** Name of the module searched by `onSearch` in the first option of the list (« Calendrier »). */
  scopeLabel?: string;
  /** Global search: the field becomes a combobox listing the results of every module. */
  searchSource?: GlobalSearchSource;
  /** Destination of a result; a result without one is shown without a link. */
  resultHref?: GlobalSearchResultHref;
  /** Opens a result's destination (full-page navigation by default). */
  onNavigate?: (href: string) => void;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

type Option =
  | { type: 'scope'; id: string }
  | { type: 'result'; id: string; item: GlobalSearchItem; module: GlobalSearchModule; href?: string };

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** What the always-present `role="status"` region says for the current state. */
export function headerSearchAnnouncement(status: Status, result?: GlobalSearchResult): string {
  if (status === 'loading') return 'Recherche en cours…';
  if (status === 'error') return 'La recherche est indisponible pour le moment.';
  if (status !== 'done' || !result) return '';
  const count = result.groups.reduce((total, group) => total + group.items.length, 0);
  const found = count === 0 ? 'Aucun résultat' : plural(count, 'résultat', 'résultats');
  const missing = result.unavailable.map((module) => globalSearchModuleLabels[module]);
  return missing.length ? `${found}. ${missing.join(', ')} ${missing.length === 1 ? 'ne répond' : 'ne répondent'} pas.` : `${found}.`;
}

const unavailableText = (modules: GlobalSearchModule[]) => {
  const names = modules.map((module) => globalSearchModuleLabels[module]);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}` : names[0];
  return names.length > 1
    ? `${list} ne répondent pas : leurs résultats ne sont pas affichés.`
    : `${list} ne répond pas : ses résultats ne sont pas affichés.`;
};

const defaultNavigate = (href: string) => { window.location.assign(href); };

/**
 * Search field of the header (Figma `Header/SearchResults`). Without `searchSource` it is the
 * module's own search box. With it, it is an ARIA combobox: after a pause of 250 ms on a term of
 * 2 characters or more it asks the source (aborting the previous call) and lists the results by
 * module; arrows move the active option, Entrée opens it, Échap closes the list then clears the
 * field. Focus never leaves the field (`aria-activedescendant`) and a status region announces the
 * result count.
 */
export function HeaderSearch({ label, placeholder, value, onChange, onSearch, scopeLabel, searchSource, resultHref, onNavigate = defaultNavigate }: HeaderSearchProps) {
  const [ownQuery, setOwnQuery] = React.useState('');
  const query = value ?? ownQuery;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const baseId = React.useId();
  const listId = `${baseId}-results`;

  // Answer and active option are kept with the term they belong to: a new term shows « loading »
  // and no active option without resetting state from an effect.
  const [answer, setAnswer] = React.useState<{ term: string; status: 'done' | 'error'; result?: GlobalSearchResult }>();
  const [open, setOpen] = React.useState(false);
  const [activeState, setActiveState] = React.useState({ term: '', index: -1 });

  const update = (next: string) => {
    setActiveState({ term: '', index: -1 });
    if (value === undefined) setOwnQuery(next);
    onChange?.(next);
  };
  const clear = () => { update(''); setOpen(false); inputRef.current?.focus(); };

  const global = Boolean(searchSource);
  const term = query.trim();
  const searchable = global && isGlobalSearchTerm(query);

  const status: Status = !searchable ? 'idle' : answer?.term === term ? answer.status : 'loading';
  const result = status === 'done' ? answer?.result : undefined;
  const active = activeState.term === term ? activeState.index : -1;
  const setActive = (update: (current: number) => number) => setActiveState({ term, index: update(active) });

  // Debounced, abortable global search. A newer term or an unmount aborts the call in flight, so
  // a stale answer never replaces the current one.
  React.useEffect(() => {
    if (!searchSource || !searchable) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      searchSource(term, controller.signal).then(
        (found) => { if (!controller.signal.aborted) setAnswer({ term, status: 'done', result: found }); },
        () => { if (!controller.signal.aborted) setAnswer({ term, status: 'error' }); },
      );
    }, GLOBAL_SEARCH_DEBOUNCE_MS);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [searchSource, searchable, term]);

  const options: Option[] = [];
  if (searchable && onSearch) options.push({ type: 'scope', id: `${baseId}-scope` });
  if (status === 'done' && result) {
    for (const group of result.groups) {
      group.items.forEach((item, index) => options.push({
        type: 'result',
        id: `${baseId}-${group.module}-${index}`,
        item,
        module: group.module,
        href: resultHref?.(item, group.module),
      }));
    }
  }
  const expanded = global && open && searchable;
  const activeOption = expanded && active >= 0 ? options[active] : undefined;

  // Focus stays in the field, so the browser does not scroll the list: bring the active option into view.
  const activeId = activeOption?.id;
  React.useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' });
  }, [activeId]);

  const choose = (option: Option) => {
    if (option.type === 'result' && !option.href) return;
    setOpen(false);
    inputRef.current?.focus();
    if (option.type === 'scope') onSearch?.(query);
    else onNavigate(option.href!);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (expanded) { event.preventDefault(); setOpen(false); setActive(() => -1); return; }
      if (query) { event.preventDefault(); update(''); }
      return;
    }
    if (!global || !searchable) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (!options.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((current) => (current < 0 ? (step > 0 ? 0 : options.length - 1) : (current + step + options.length) % options.length));
      return;
    }
    if (event.key === 'Enter' && activeOption) { event.preventDefault(); choose(activeOption); }
  };

  const renderOption = (option: Extract<Option, { type: 'result' }>) => {
    const selected = activeOption?.id === option.id;
    const detail = globalSearchDetail(option.item);
    return (
      <li
        key={option.id}
        id={option.id}
        role="option"
        aria-selected={selected}
        aria-disabled={option.href ? undefined : true}
        data-href={option.href}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => choose(option)}
        className={`flex flex-col rounded-md px-3 py-2 ${option.href ? 'cursor-pointer hover:bg-[var(--mairie-accent-surface)]' : 'cursor-default'} ${selected ? 'bg-[var(--mairie-accent-surface)]' : ''}`}
      >
        <Text size="s" weight="medium" truncate>{option.item.title}</Text>
        {detail && <Caption truncate>{detail}</Caption>}
      </li>
    );
  };

  const scope = options[0]?.type === 'scope' ? options[0] : undefined;
  const groups = status === 'done' && result ? result.groups : [];
  const empty = status === 'done' && result && groups.length === 0;

  return (
    <form
      role="search"
      aria-label={label}
      className="relative min-w-0"
      onSubmit={(event) => { event.preventDefault(); setOpen(false); onSearch?.(query); }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}
    >
      <Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mairie-muted)]" />
      <input
        ref={inputRef}
        type="search"
        role={global ? 'combobox' : undefined}
        aria-label={label}
        aria-autocomplete={global ? 'list' : undefined}
        aria-expanded={global ? expanded : undefined}
        aria-controls={global ? listId : undefined}
        aria-activedescendant={activeOption?.id}
        autoComplete={global ? 'off' : undefined}
        maxLength={global ? 100 : undefined}
        placeholder={placeholder}
        value={query}
        onChange={(event) => { update(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-9 w-40 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] pl-10 pr-9 text-sm text-[var(--mairie-text)] shadow-none outline-none transition-colors placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/15 sm:w-64 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && <button
        type="button"
        aria-label="Effacer la recherche"
        onClick={clear}
        className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--mairie-muted)] hover:bg-[var(--mairie-surface)] hover:text-[var(--mairie-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]"
      >
        <X aria-hidden="true" className="h-3.5 w-3.5" />
      </button>}

      {global && <p role="status" className="sr-only">{expanded ? headerSearchAnnouncement(status, result) : ''}</p>}

      {global && <div
        data-header-search-popover
        hidden={!expanded}
        className="absolute left-0 top-full z-40 mt-1.5 w-[min(26rem,calc(100vw-2rem))] rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-2 shadow-lg"
      >
        <ul id={listId} role="listbox" aria-label={`Résultats de recherche pour « ${term} »`} className="m-0 flex max-h-[min(28rem,70vh)] list-none flex-col gap-1 overflow-y-auto p-0">
          {scope && <li
            id={scope.id}
            role="option"
            aria-selected={activeOption?.id === scope.id}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => choose(scope)}
            className={`cursor-pointer rounded-md px-3 py-2 hover:bg-[var(--mairie-accent-surface)] ${activeOption?.id === scope.id ? 'bg-[var(--mairie-accent-surface)]' : ''}`}
          >
            <Text size="s" weight="medium" tone="primary">{`Rechercher « ${term} » dans ${scopeLabel?.trim() || 'ce module'}`}</Text>
          </li>}
          {groups.map((group) => (
            <li key={group.module} role="presentation" className="flex flex-col py-1">
              <ul role="group" aria-labelledby={`${baseId}-${group.module}-label`} className="m-0 flex list-none flex-col gap-0.5 p-0">
                <li role="presentation" className="px-3 py-1"><Overline id={`${baseId}-${group.module}-label`}>{globalSearchModuleLabels[group.module]}</Overline></li>
                {options.filter((option): option is Extract<Option, { type: 'result' }> => option.type === 'result' && option.module === group.module).map(renderOption)}
              </ul>
            </li>
          ))}
        </ul>
        {status === 'loading' && <div className="px-3 py-3"><Text size="s" tone="muted">Recherche en cours…</Text></div>}
        {empty && <div className="flex flex-col gap-0.5 px-3 py-3">
          <Text size="s" weight="medium">{`Aucun résultat pour « ${term} »`}</Text>
          <Caption>Vérifiez l’orthographe ou essayez un autre terme.</Caption>
        </div>}
        {status === 'done' && result && result.unavailable.length > 0 && (
          <Alert role="note" tone="warning" size="s" title={unavailableText(result.unavailable)} className="mt-1" />
        )}
        {status === 'error' && <Alert role="note" tone="danger" size="s" title="La recherche est indisponible pour le moment. Réessayez dans un instant." />}
      </div>}
    </form>
  );
}
