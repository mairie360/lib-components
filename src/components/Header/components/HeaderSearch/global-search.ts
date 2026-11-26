/**
 * Global search of the header: the result shape served by every BFF's `GET /search`, the default
 * source calling it on the front's own origin, and the links built from the shell destinations.
 */

export type GlobalSearchModule = 'agents' | 'projects' | 'calendar' | 'messages' | 'elearning';
export type GlobalSearchKind = 'agent' | 'project' | 'task' | 'event' | 'conversation' | 'message' | 'course';

export interface GlobalSearchItem {
  kind: GlobalSearchKind;
  id: number;
  title: string;
  excerpt?: string | null;
  parent_id?: number | null;
  updated_at?: string | null;
}

export interface GlobalSearchGroup {
  module: GlobalSearchModule;
  items: GlobalSearchItem[];
}

/** Answer of a BFF `GET /search`: results grouped by module, and the modules that could not answer. */
export interface GlobalSearchResult {
  groups: GlobalSearchGroup[];
  unavailable: GlobalSearchModule[];
}

/** Supplied by the front: searches `query` and rejects when the search itself failed. `signal` aborts a stale call. */
export type GlobalSearchSource = (query: string, signal: AbortSignal) => Promise<GlobalSearchResult>;

/** Builds the destination of a result, or `undefined` when it has none (the result is shown without a link). */
export type GlobalSearchResultHref = (item: GlobalSearchItem, module: GlobalSearchModule) => string | undefined;

export const GLOBAL_SEARCH_MIN_LENGTH = 2;
export const GLOBAL_SEARCH_MAX_LENGTH = 100;
export const GLOBAL_SEARCH_DEBOUNCE_MS = 250;

export const globalSearchModuleLabels: Record<GlobalSearchModule, string> = {
  agents: 'Agents',
  projects: 'Projets',
  calendar: 'Calendrier',
  messages: 'Messagerie',
  elearning: 'E-learning',
};

/** Shell destination (`hrefs` key, sidebar item id) of each module. */
export const globalSearchDestinations: Record<GlobalSearchModule, string> = {
  agents: 'admin',
  projects: 'projects',
  calendar: 'calendar',
  messages: 'messages',
  elearning: 'training',
};

const modules = Object.keys(globalSearchModuleLabels) as GlobalSearchModule[];
const kinds: GlobalSearchKind[] = ['agent', 'project', 'task', 'event', 'conversation', 'message', 'course'];

/** True for a term the search accepts once trimmed: 2 to 100 characters. */
export function isGlobalSearchTerm(query: string): boolean {
  const term = query.trim();
  return term.length >= GLOBAL_SEARCH_MIN_LENGTH && term.length <= GLOBAL_SEARCH_MAX_LENGTH;
}

const isOptional = (value: unknown, check: (present: unknown) => boolean) => value === undefined || value === null || check(value);

const isItem = (value: unknown): value is GlobalSearchItem => {
  const item = value as GlobalSearchItem;
  return Boolean(item) && typeof item === 'object'
    && kinds.includes(item.kind) && Number.isInteger(item.id) && typeof item.title === 'string'
    && isOptional(item.excerpt, (excerpt) => typeof excerpt === 'string')
    && isOptional(item.parent_id, (parent) => Number.isInteger(parent))
    && isOptional(item.updated_at, (date) => typeof date === 'string');
};

/** Keeps the known modules and well-formed items of an answer; rejects anything else. */
export function parseGlobalSearchResult(body: unknown): GlobalSearchResult {
  const value = body as Partial<GlobalSearchResult> | null;
  if (!value || !Array.isArray(value.groups) || !Array.isArray(value.unavailable)) throw new Error('Unexpected search answer');
  return {
    groups: value.groups
      .filter((group): group is GlobalSearchGroup => Boolean(group) && modules.includes(group.module) && Array.isArray(group.items))
      .map((group) => ({ module: group.module, items: group.items.filter(isItem) }))
      .filter((group) => group.items.length > 0),
    unavailable: value.unavailable.filter((module): module is GlobalSearchModule => modules.includes(module)),
  };
}

export interface BffSearchSourceOptions {
  /** Same-origin path of the BFF route, proxied by the front (default `/search`). */
  path?: string;
  /** Most results per module, 1 to 20 (BFF default when omitted). */
  limit?: number;
  fetch?: typeof fetch;
}

/** Source calling the front's same-origin `GET /search`, which its proxy forwards to its BFF with the session. */
export function createBffSearchSource({ path = '/search', limit, fetch: fetchImpl }: BffSearchSourceOptions = {}): GlobalSearchSource {
  return async (query, signal) => {
    const params = new URLSearchParams({ q: query.trim() });
    if (limit !== undefined) params.set('limit', String(limit));
    const response = await (fetchImpl ?? fetch)(`${path}?${params}`, {
      signal,
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Search failed with status ${response.status}`);
    return parseGlobalSearchResult(await response.json());
  };
}

const isAbsoluteWebUrl = (href: string) => /^https?:\/\//i.test(href);
const isSafeRelativeUrl = (href: string) => !href.startsWith('//') && !href.includes('\\') && !/^[a-z][a-z\d+.-]*:/i.test(href);

/** Local calendar day (YYYY-MM-DD) of an ISO date-time, or `undefined`. */
export function localDay(value?: string | null): string | undefined {
  const date = value ? new Date(value) : undefined;
  if (!date || Number.isNaN(date.getTime())) return undefined;
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const targetParams = ['user', 'project', 'task', 'date', 'event', 'conversation', 'message', 'course'];

function resultParams(item: GlobalSearchItem): [string, string][] {
  const id = String(item.id);
  const parent = item.parent_id == null ? [] : [String(item.parent_id)];
  switch (item.kind) {
    case 'agent': return [['user', id]];
    case 'project': return [['project', id]];
    case 'task': return [...parent.map((value): [string, string] => ['project', value]), ['task', id]];
    case 'event': {
      const day = localDay(item.updated_at);
      return [...(day ? [['date', day] as [string, string]] : []), ['event', id]];
    }
    case 'conversation': return [['conversation', id]];
    case 'message': return [...parent.map((value): [string, string] => ['conversation', value]), ['message', id]];
    case 'course': return [['course', id]];
  }
}

/**
 * Default link of a result: the module's shell destination (`hrefs`) with the target in its query,
 * e.g. `projects?project=7&task=9` or `calendar?date=2026-12-03&event=4`. `undefined` when the
 * shell has no safe destination for the module (Administration hidden from an agent).
 */
export function globalSearchHref(item: GlobalSearchItem, module: GlobalSearchModule, hrefs: Record<string, string | undefined>): string | undefined {
  const base = hrefs[globalSearchDestinations[module]]?.trim();
  if (!base || !(isAbsoluteWebUrl(base) || isSafeRelativeUrl(base))) return undefined;
  const hashAt = base.indexOf('#');
  const withoutHash = hashAt < 0 ? base : base.slice(0, hashAt);
  const hash = hashAt < 0 ? '' : base.slice(hashAt);
  const queryAt = withoutHash.indexOf('?');
  const path = queryAt < 0 ? withoutHash : withoutHash.slice(0, queryAt);
  // The destination's own parameters stay; the target parameters replace any it already carries.
  const params = new URLSearchParams(queryAt < 0 ? '' : withoutHash.slice(queryAt + 1));
  for (const key of targetParams) params.delete(key);
  for (const [key, value] of resultParams(item)) params.set(key, value);
  return `${path}?${params}${hash}`;
}

const dayFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });

/** Second line of a result: what it is (when the module holds several kinds) and its excerpt. */
export function globalSearchDetail(item: GlobalSearchItem): string {
  const date = item.updated_at ? new Date(item.updated_at) : undefined;
  const kind: Record<GlobalSearchKind, string | undefined> = {
    agent: undefined,
    project: 'Projet',
    task: 'Tâche',
    event: date && !Number.isNaN(date.getTime()) ? `Événement · ${dayFormat.format(date)}` : 'Événement',
    conversation: 'Conversation',
    message: 'Message',
    course: undefined,
  };
  return [kind[item.kind], item.excerpt?.trim()].filter(Boolean).join(' · ');
}
