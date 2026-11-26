import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent, within } from 'storybook/test';
import { Header, HeaderProps, type GlobalSearchResult, type GlobalSearchSource } from '../components/Header';

const meta: Meta<typeof Header> = {
  title: 'Components/Header/Header',
  component: Header,
  tags: ['autodocs'],
};

export default meta;

export const Admin: StoryObj<HeaderProps> = {
  args: {
    user: {
      name: 'Admin Système',
      avatarUrl: '',
      email: 'admin@mairie360.fr',
      role: 'admin',
    },
    isAdmin: true,
    onPageChange: (page) => alert(`Page sélectionnée : ${page}`),
    onLogout: () => alert('Déconnexion'),
  },
};

export const StandardUser: StoryObj<HeaderProps> = {
  args: {
    user: {
      name: 'Alice Dupont',
      avatarUrl: '/logo.png',
      email: 'alice@mairie360.fr',
      role: 'user',
    },
    onPageChange: (page) => alert(`Page sélectionnée : ${page}`),
    onLogout: () => alert('Déconnexion'),
  },
};

/** MAIR-834: « Déconnexion » opens the confirmation; `onLogout` runs after « Se déconnecter » (a promise keeps it loading). */
export const LogoutConfirmation: StoryObj<HeaderProps> = {
  args: {
    user: { name: 'Quentin Tennerel', email: 'agent@mairie360.fr', role: 'user' },
    onLogout: fn(() => new Promise((resolve) => setTimeout(resolve, 1200))),
  },
};

/** MAIR-835: search as you type, with the ✕ clear button and Échap. */
export const SearchAsYouType: StoryObj<HeaderProps> = {
  args: {
    user: { name: 'Quentin Tennerel', email: 'agent@mairie360.fr', role: 'user' },
    searchLabel: 'Rechercher un événement',
    searchPlaceholder: 'Rechercher un événement…',
    onSearchChange: fn(),
    onSearch: fn(),
  },
};

/** MAIR-1109: commune block (« Mairie de » + name) left of the search, the date at the start of the right zone, and the bell Counter (MAIR-1094). */
export const CommuneAndDate: StoryObj<HeaderProps> = {
  args: {
    user: { name: 'Claire Martin', email: 'claire.martin@mairie360.fr', role: 'user' },
    commune: 'Saint-André',
    showDate: true,
    date: 'jeudi 19 novembre',
    onSearch: fn(),
    onNotificationsClick: fn(),
    notificationCount: 12,
  },
};

/** MAIR-1109: a long commune name ends with an ellipsis without breaking the bar. */
export const LongCommuneName: StoryObj<HeaderProps> = {
  args: {
    commune: 'Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson',
    onSearch: fn(),
    onNotificationsClick: fn(),
    notificationCount: 3,
  },
};

/** MAIR-1109: the commune block can be hidden. */
export const WithoutCommune: StoryObj<HeaderProps> = {
  args: { showCommune: false, onSearch: fn() },
};

const searchResults: GlobalSearchResult = {
  groups: [
    { module: 'agents', items: [{ kind: 'agent', id: 4, title: 'Anne Dupont', excerpt: 'anne.dupont@mairie.fr' }] },
    { module: 'projects', items: [{ kind: 'project', id: 7, title: 'Voirie rue Dupont' }, { kind: 'task', id: 9, title: 'Devis Dupont', parent_id: 7 }] },
    { module: 'messages', items: [{ kind: 'message', id: 12, title: 'Équipe voirie', excerpt: '…rendez-vous avec M. Dupont jeudi…', parent_id: 3 }] },
  ],
  unavailable: [],
};

const answerWith = (result: GlobalSearchResult | Error | 'pending'): GlobalSearchSource => () =>
  result === 'pending' ? new Promise(() => undefined) : result instanceof Error ? Promise.reject(result) : Promise.resolve(result);

const globalSearchStory = (searchSource: GlobalSearchSource, extra: Partial<HeaderProps> = {}): StoryObj<HeaderProps> => ({
  args: {
    user: { name: 'Quentin Tennerel', email: 'agent@mairie360.fr', role: 'user' },
    commune: 'Saint-André',
    searchSource,
    searchResultHref: (item, module) => `#${module}-${item.id}`,
    onSearchNavigate: fn(),
    ...extra,
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('combobox');
    await userEvent.type(field, 'dupont');
  },
});

/** Global search (Figma `Header/SearchResults` « Résultats »): results by module, the module search first. */
export const GlobalSearchResults = globalSearchStory(answerWith(searchResults), { onSearch: fn(), searchScopeLabel: 'Calendrier' });
/** Global search, « Chargement ». */
export const GlobalSearchLoading = globalSearchStory(answerWith('pending'));
/** Global search, « Aucun résultat ». */
export const GlobalSearchEmpty = globalSearchStory(answerWith({ groups: [], unavailable: [] }));
/** Global search, « Module indisponible »: the other modules' results stay. */
export const GlobalSearchUnavailableModule = globalSearchStory(answerWith({
  groups: [{ module: 'calendar', items: [{ kind: 'event', id: 2, title: 'Conseil municipal Dupont', updated_at: '2026-12-03T18:00:00Z' }] }],
  unavailable: ['messages', 'elearning'],
}));
/** Global search, « Erreur »: the search itself failed. */
export const GlobalSearchError = globalSearchStory(answerWith(new Error('unavailable')));
