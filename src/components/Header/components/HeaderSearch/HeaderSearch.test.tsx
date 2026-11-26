import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import '@testing-library/jest-dom';

import { HeaderSearch, headerSearchAnnouncement } from './HeaderSearch';
import {
  createBffSearchSource,
  globalSearchDetail,
  globalSearchHref,
  parseGlobalSearchResult,
  type GlobalSearchItem,
  type GlobalSearchResult,
  type GlobalSearchSource,
} from './global-search';

const item = (kind: GlobalSearchItem['kind'], id: number, title: string, extra: Partial<GlobalSearchItem> = {}): GlobalSearchItem => ({
  kind, id, title, excerpt: null, parent_id: null, updated_at: '2026-12-03T09:00:00Z', ...extra,
});

/** Minimal `Response` (jsdom has no fetch API). */
const reply = (body: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

const answer: GlobalSearchResult = {
  groups: [
    { module: 'agents', items: [item('agent', 4, 'Anne Dupont', { excerpt: 'anne.dupont@mairie.fr' })] },
    { module: 'projects', items: [item('project', 7, 'Voirie rue Dupont'), item('task', 9, 'Devis Dupont', { parent_id: 7 })] },
  ],
  unavailable: [],
};

const hrefs = { admin: '/admin', projects: 'https://projets.mairie.fr/', calendar: '/calendar?view=month', messages: '/messages', training: '/elearning' };
const resultHref = (value: GlobalSearchItem, module: Parameters<typeof globalSearchHref>[1]) => globalSearchHref(value, module, hrefs);

/** A source resolving each call with `reply`, recording the terms and signals it got. */
function fakeSource(reply: GlobalSearchResult | Error = answer) {
  const calls: { query: string; signal: AbortSignal }[] = [];
  const source: GlobalSearchSource = jest.fn((query, signal) => {
    calls.push({ query, signal });
    return reply instanceof Error ? Promise.reject(reply) : Promise.resolve(reply);
  });
  return { source, calls };
}

async function type(field: HTMLElement, value: string) {
  fireEvent.change(field, { target: { value } });
  await act(async () => { jest.advanceTimersByTime(250); });
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('MAIR-1230 global search of the header', () => {
  it('is a combobox that waits 250 ms and 2 characters before asking the source', async () => {
    const { source, calls } = fakeSource();
    render(<HeaderSearch label="Rechercher" placeholder="Rechercher..." searchSource={source} resultHref={resultHref} />);
    const field = screen.getByRole('combobox', { name: 'Rechercher' });
    expect(field).toHaveAttribute('aria-expanded', 'false');

    fireEvent.change(field, { target: { value: 'd' } });
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(source).not.toHaveBeenCalled();

    fireEvent.change(field, { target: { value: ' du' } });
    await act(async () => { jest.advanceTimersByTime(249); });
    expect(source).not.toHaveBeenCalled();
    await act(async () => { jest.advanceTimersByTime(1); });
    expect(calls.map(({ query }) => query)).toEqual(['du']);
  });

  it('aborts the previous call when the term changes, so a stale answer never shows', async () => {
    let resolveFirst!: (value: GlobalSearchResult) => void;
    const signals: AbortSignal[] = [];
    const source: GlobalSearchSource = jest.fn((query, signal) => {
      signals.push(signal);
      return query === 'dup' ? new Promise((resolve) => { resolveFirst = resolve; }) : Promise.resolve({ groups: [], unavailable: [] });
    });
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} />);
    const field = screen.getByRole('combobox');

    await type(field, 'dup');
    await type(field, 'dupx');
    expect(signals[0].aborted).toBe(true);
    await act(async () => { resolveFirst(answer); });

    expect(screen.queryByRole('option', { name: /Anne Dupont/ })).not.toBeInTheDocument();
    expect(screen.getByText('Aucun résultat pour « dupx »')).toBeInTheDocument();
  });

  it('lists the results grouped by module and announces their count', async () => {
    const { source } = fakeSource();
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} resultHref={resultHref} />);
    const field = screen.getByRole('combobox');

    fireEvent.change(field, { target: { value: 'dupont' } });
    expect(screen.getByRole('status')).toHaveTextContent('Recherche en cours…');
    await act(async () => { jest.advanceTimersByTime(250); });

    expect(field).toHaveAttribute('aria-expanded', 'true');
    const listbox = screen.getByRole('listbox', { name: 'Résultats de recherche pour « dupont »' });
    expect(within(listbox).getByRole('group', { name: 'Agents' })).toHaveTextContent('Anne Dupontanne.dupont@mairie.fr');
    const projects = within(listbox).getByRole('group', { name: 'Projets' });
    expect(within(projects).getAllByRole('option').map((option) => option.textContent)).toEqual(['Voirie rue DupontProjet', 'Devis DupontTâche']);
    expect(screen.getByRole('status')).toHaveTextContent('3 résultats.');
  });

  it('moves with the arrows, opens the active result with Enter and keeps the focus in the field', async () => {
    const onNavigate = jest.fn();
    const { source } = fakeSource();
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} resultHref={resultHref} onNavigate={onNavigate} />);
    const field = screen.getByRole('combobox');
    field.focus();
    await type(field, 'dupont');

    fireEvent.keyDown(field, { key: 'ArrowDown' });
    const options = screen.getAllByRole('option');
    expect(field).toHaveAttribute('aria-activedescendant', options[0].id);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    expect(field).toHaveAttribute('aria-activedescendant', options[0].id);
    fireEvent.keyDown(field, { key: 'ArrowUp' });
    expect(field).toHaveAttribute('aria-activedescendant', options[2].id);

    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith('https://projets.mairie.fr/?project=7&task=9');
    expect(field).toHaveAttribute('aria-expanded', 'false');
    expect(field).toHaveFocus();
  });

  it('forgets the arrow selection as soon as the term is edited', async () => {
    const onSearch = jest.fn(); const onNavigate = jest.fn();
    const { source } = fakeSource();
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} resultHref={resultHref} onSearch={onSearch} onNavigate={onNavigate} />);
    const field = screen.getByRole('combobox');
    await type(field, 'dupont');
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'ArrowDown' });

    fireEvent.change(field, { target: { value: 'duponts' } });
    fireEvent.change(field, { target: { value: 'dupont' } });
    expect(field).not.toHaveAttribute('aria-activedescendant');
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('scrolls the active option into view while focus stays in the field', async () => {
    const scrollIntoView = jest.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    const { source } = fakeSource();
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} resultHref={resultHref} />);
    const field = screen.getByRole('combobox');
    await type(field, 'dupont');

    fireEvent.keyDown(field, { key: 'ArrowUp' });
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'nearest' });
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(screen.getAllByRole('option').at(-1));
    delete (HTMLElement.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  });

  it('opens a result on click', async () => {
    const onNavigate = jest.fn();
    const { source } = fakeSource();
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} resultHref={resultHref} onNavigate={onNavigate} />);
    await type(screen.getByRole('combobox'), 'dupont');

    fireEvent.click(screen.getByRole('option', { name: /Anne Dupont/ }));
    expect(onNavigate).toHaveBeenCalledWith('/admin?user=4');
  });

  it('shows a result without destination without a link', async () => {
    const onNavigate = jest.fn();
    const { source } = fakeSource();
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} resultHref={(value) => (value.kind === 'agent' ? undefined : '/x')} onNavigate={onNavigate} />);
    await type(screen.getByRole('combobox'), 'dupont');

    const agent = screen.getByRole('option', { name: /Anne Dupont/ });
    expect(agent).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(agent);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('Escape closes the list first, then clears the field', async () => {
    const onChange = jest.fn();
    const { source } = fakeSource();
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} onChange={onChange} />);
    const field = screen.getByRole('combobox');
    await type(field, 'dupont');

    fireEvent.keyDown(field, { key: 'Escape' });
    expect(field).toHaveAttribute('aria-expanded', 'false');
    expect(field).toHaveValue('dupont');
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(field).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('keeps the module search as the first option and on a plain Enter', async () => {
    const onSearch = jest.fn();
    const { source } = fakeSource();
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} onSearch={onSearch} scopeLabel="Calendrier" />);
    const field = screen.getByRole('combobox');
    await type(field, 'conseil');

    const scope = screen.getAllByRole('option')[0];
    expect(scope).toHaveTextContent('Rechercher « conseil » dans Calendrier');
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('conseil');

    onSearch.mockClear();
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).toHaveBeenCalledWith('conseil');
  });

  it('says when nothing matches', async () => {
    const { source } = fakeSource({ groups: [], unavailable: [] });
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} />);
    await type(screen.getByRole('combobox'), 'zzdupont');

    expect(screen.getByText('Aucun résultat pour « zzdupont »')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aucun résultat.');
  });

  it('names the modules that did not answer and keeps the others', async () => {
    const { source } = fakeSource({ groups: [{ module: 'calendar', items: [item('event', 2, 'Conseil municipal')] }], unavailable: ['messages', 'elearning'] });
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} />);
    await type(screen.getByRole('combobox'), 'conseil');

    expect(screen.getByRole('option', { name: /Conseil municipal/ })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('Messagerie et E-learning ne répondent pas : leurs résultats ne sont pas affichés.');
    expect(screen.getByRole('status')).toHaveTextContent('1 résultat. Messagerie, E-learning ne répondent pas.');
  });

  it('says the search is unavailable when the source fails', async () => {
    const { source } = fakeSource(new Error('boom'));
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} />);
    await type(screen.getByRole('combobox'), 'dupont');

    expect(screen.getByRole('note')).toHaveTextContent('La recherche est indisponible pour le moment. Réessayez dans un instant.');
    expect(screen.getByRole('status')).toHaveTextContent('La recherche est indisponible pour le moment.');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('the status region is always present, even before any search', () => {
    const { source } = fakeSource();
    render(<HeaderSearch label="Rechercher" placeholder="" searchSource={source} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('stays a plain search box without a source', () => {
    render(<HeaderSearch label="Rechercher un événement" placeholder="" onSearch={jest.fn()} />);
    expect(screen.getByRole('searchbox', { name: 'Rechercher un événement' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('has no axe violation with the list open', async () => {
    const { source } = fakeSource({ ...answer, unavailable: ['messages'] });
    const { container } = render(<main><HeaderSearch label="Rechercher" placeholder="Rechercher..." searchSource={source} resultHref={resultHref} onSearch={jest.fn()} /></main>);
    const field = screen.getByRole('combobox');
    await type(field, 'dupont');
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    jest.useRealTimers();
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('MAIR-1230 global search helpers', () => {
  it('builds each result link from the shell destinations', () => {
    expect(globalSearchHref(item('project', 7, 'P'), 'projects', hrefs)).toBe('https://projets.mairie.fr/?project=7');
    expect(globalSearchHref(item('task', 9, 'T', { parent_id: 7 }), 'projects', hrefs)).toBe('https://projets.mairie.fr/?project=7&task=9');
    expect(globalSearchHref(item('event', 4, 'E', { updated_at: '2026-12-03T09:00:00Z' }), 'calendar', hrefs)).toBe('/calendar?view=month&date=2026-12-03&event=4');
    expect(globalSearchHref(item('conversation', 5, 'C'), 'messages', hrefs)).toBe('/messages?conversation=5');
    expect(globalSearchHref(item('message', 6, 'M', { parent_id: 5 }), 'messages', hrefs)).toBe('/messages?conversation=5&message=6');
    expect(globalSearchHref(item('course', 3, 'F'), 'elearning', hrefs)).toBe('/elearning?course=3');
    expect(globalSearchHref(item('agent', 4, 'A'), 'agents', hrefs)).toBe('/admin?user=4');
  });

  it('replaces the target parameters a destination already carries and keeps the others', () => {
    expect(globalSearchHref(item('project', 7, 'P'), 'projects', { projects: '/projects?project=2&view=board#top' })).toBe('/projects?view=board&project=7#top');
    expect(globalSearchHref(item('task', 9, 'T'), 'projects', { projects: '/projects?project=2' })).toBe('/projects?task=9');
  });

  it('has no link without a safe destination', () => {
    expect(globalSearchHref(item('agent', 4, 'A'), 'agents', {})).toBeUndefined();
    expect(globalSearchHref(item('project', 1, 'P'), 'projects', { projects: 'javascript:alert(1)' })).toBeUndefined();
    expect(globalSearchHref(item('project', 1, 'P'), 'projects', { projects: '//evil.example' })).toBeUndefined();
  });

  it('describes a result by its kind and excerpt', () => {
    expect(globalSearchDetail(item('agent', 1, 'A', { excerpt: 'a@mairie.fr' }))).toBe('a@mairie.fr');
    expect(globalSearchDetail(item('task', 1, 'T'))).toBe('Tâche');
    expect(globalSearchDetail(item('event', 1, 'E', { updated_at: '2026-12-03T09:00:00Z' }))).toBe('Événement · 3 décembre');
    expect(globalSearchDetail(item('message', 1, 'M', { excerpt: 'rendez-vous jeudi' }))).toBe('Message · rendez-vous jeudi');
  });

  it('announces counts in French', () => {
    expect(headerSearchAnnouncement('idle')).toBe('');
    expect(headerSearchAnnouncement('done', { groups: [{ module: 'projects', items: [item('project', 1, 'P')] }], unavailable: ['calendar'] })).toBe('1 résultat. Calendrier ne répond pas.');
  });

  it('createBffSearchSource calls the same-origin /search and keeps only well-formed results', async () => {
    const fetchImpl = jest.fn(async () => reply({
      groups: [{ module: 'projects', items: [
        item('project', 1, 'P'),
        { kind: 'nope', id: 2, title: 'X' },
        { ...item('project', 3, 'Q'), excerpt: 42 },
        { ...item('task', 4, 'R'), parent_id: '7' },
        { ...item('project', 5, 'S'), updated_at: 0 },
      ] }, { module: 'other', items: [] }],
      unavailable: ['calendar', 'other'],
    }));
    const controller = new AbortController();
    const result = await createBffSearchSource({ limit: 5, fetch: fetchImpl as unknown as typeof fetch })(' dupont ', controller.signal);

    expect(fetchImpl).toHaveBeenCalledWith('/search?q=dupont&limit=5', expect.objectContaining({ signal: controller.signal, credentials: 'same-origin' }));
    expect(result).toEqual({ groups: [{ module: 'projects', items: [item('project', 1, 'P')] }], unavailable: ['calendar'] });
  });

  it('createBffSearchSource rejects an error status or an answer out of contract', async () => {
    const signal = new AbortController().signal;
    await expect(createBffSearchSource({ fetch: (async () => reply({}, 401)) as unknown as typeof fetch })('ab', signal)).rejects.toThrow('401');
    expect(() => parseGlobalSearchResult({ results: [] })).toThrow();
  });
});
