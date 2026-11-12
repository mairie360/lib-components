import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Info } from 'lucide-react';
import * as root from '../index';
import * as primitives from '../entries/primitives';
import * as shell from '../entries/shell';
import { InstanceProvider } from '../kit/react';
import { COMPONENT_MARKER, componentMarker } from '../components/component-marker';

// MAIR-318: every exported component puts data-m360-component="<its exported name>" on its root DOM element,
// so the RGAA engine of mairie360/CICD can report the lib components a front uses that no captured state shows.

const exported: Record<string, unknown> = { ...root, ...primitives, ...shell };
const isComponent = (name: string, value: unknown) =>
  /^[A-Z]/.test(name) && (typeof value === 'function' || (typeof value === 'object' && value !== null && '$$typeof' in value));
const components = Object.keys(exported).filter(name => isComponent(name, exported[name])).sort();

// Parts that render no element of their own: nothing to mark.
const noElement = ['DropdownMenuPortal', 'SelectScrollDownButton', 'SelectScrollUpButton'];

const noop = () => undefined;
const L = root;
const P = primitives;
const S = shell;

type Fixture = {
  element: React.ReactElement;
  /** The marker sits on the first rendered element (false: the component has no single root, or is a part of a scene). */
  root?: boolean;
  /** Interaction that shows the part (opens a listbox, a menu). */
  open?: (container: HTMLElement) => void;
};

const selectScene = (
  <P.Select defaultValue="a">
    <P.SelectTrigger aria-label="Choix"><P.SelectValue placeholder="Choisir" /></P.SelectTrigger>
    <P.SelectContent>
      <P.SelectGroup>
        <P.SelectLabel>Groupe</P.SelectLabel>
        <P.SelectItem value="a">Option A</P.SelectItem>
        <P.SelectSeparator />
      </P.SelectGroup>
    </P.SelectContent>
  </P.Select>
);
const openSelect = (container: HTMLElement) => fireEvent.click(container.querySelector('[data-slot="select-trigger"]')!);

const menuScene = (
  <P.DropdownMenu open onOpenChange={noop}>
    <P.DropdownMenuTrigger>Menu</P.DropdownMenuTrigger>
    <P.DropdownMenuContent>
      <P.DropdownMenuLabel>Actions</P.DropdownMenuLabel>
      <P.DropdownMenuGroup>
        <P.DropdownMenuItem>Ouvrir<P.DropdownMenuShortcut>⌘O</P.DropdownMenuShortcut></P.DropdownMenuItem>
      </P.DropdownMenuGroup>
      <P.DropdownMenuSeparator />
      <P.DropdownMenuCheckboxItem checked>Afficher</P.DropdownMenuCheckboxItem>
      <P.DropdownMenuRadioGroup value="a">
        <P.DropdownMenuRadioItem value="a">Vue A</P.DropdownMenuRadioItem>
      </P.DropdownMenuRadioGroup>
      <P.DropdownMenuSub>
        <P.DropdownMenuSubTrigger>Plus</P.DropdownMenuSubTrigger>
        <P.DropdownMenuSubContent><P.DropdownMenuItem>Archiver</P.DropdownMenuItem></P.DropdownMenuSubContent>
      </P.DropdownMenuSub>
    </P.DropdownMenuContent>
  </P.DropdownMenu>
);

const textPresets = ['Body', 'BodySmall', 'Caption', 'ErrorText', 'Help', 'Label', 'Link', 'Metric', 'ModalTitle', 'Overline', 'PageTitle', 'PanelTitle', 'SectionTitle'] as const;
const buttonPresets = ['BackButton', 'CancelButton', 'CloseButton', 'ConfirmDeleteButton', 'CreateButton', 'DeleteButton', 'DownloadButton', 'EditButton', 'LogoutButton', 'RefreshButton', 'RetryButton', 'SaveButton', 'SendButton'] as const;
const fieldPresets = ['DateField', 'EmailField', 'NameField', 'NewPasswordField', 'NumberField', 'PasswordField', 'PhoneField', 'SearchField', 'TimeField'] as const;
const iconButtonPresets = ['CloseIconButton', 'DeleteIconButton', 'EditIconButton', 'MoreIconButton', 'NextIconButton', 'NotificationsIconButton', 'PreviousIconButton', 'SearchIconButton'] as const;
const alertPresets = ['ErrorAlert', 'InfoAlert', 'SuccessAlert', 'UnavailableAlert', 'WarningAlert'] as const;

const fixtures: Record<string, Fixture> = {
  AccessibleShell: { element: <InstanceProvider role="User" timeZone="Europe/Paris"><L.AccessibleShell hrefs={{}}><p>Contenu</p></L.AccessibleShell></InstanceProvider> },
  Alert: { element: <L.Alert title="Information" /> },
  AppShell: { element: <L.AppShell hrefs={{}}><p>Contenu</p></L.AppShell> },
  Avatar: { element: <L.Avatar alt="Camille Martin" /> },
  AvatarStack: { element: <L.AvatarStack label="Membres" people={[{ name: 'Camille Martin' }]} /> },
  Button: { element: <L.Button label="Valider" /> },
  Card: { element: <L.Card>Contenu</L.Card> },
  Checkbox: { element: <L.Checkbox label="Accepter" /> },
  ConfirmModal: { element: <L.ConfirmModal open title="Supprimer ?" message="Confirmer la suppression." onCancel={noop} onConfirm={noop} /> },
  CurrentDate: { element: <L.CurrentDate date={new Date('2026-11-04T10:00:00Z')} /> },
  DataState: { element: <L.DataState state="empty" /> },
  DataTable: { element: <L.DataTable label="Utilisateurs" columns={[{ key: 'name', header: 'Nom' }]} rows={[{ name: 'Camille' }]} rowKey={row => row.name} /> },
  DateTime: { element: <L.DateTime value="2026-11-04T10:00:00Z" timeZone="Europe/Paris" /> },
  DesktopNavigation: { element: <S.DesktopNavigation hrefs={{ settings: '/settings' }} onCollapsedChange={noop} /> },
  Drawer: { element: <L.Drawer open title="Détails" onClose={noop}>Contenu</L.Drawer> },
  DropdownMenu: { element: menuScene },
  Field: { element: <L.Field htmlFor="champ" label="Champ"><input id="champ" /></L.Field> },
  FileField: { element: <L.FileField label="Pièce jointe" /> },
  FilterSelect: { element: <L.FilterSelect label="Statut" options={[{ value: 'active', label: 'Actif' }]} value="" onChange={noop} /> },
  Footer: { element: <L.Footer /> },
  FormActions: { element: <L.FormActions /> },
  FormSection: { element: <L.FormSection title="Identité">Contenu</L.FormSection> },
  Header: { element: <L.Header /> },
  Icon: { element: <L.Icon icon={Info} label="Information" /> },
  IconButton: { element: <L.IconButton preset="close" /> },
  LinkButton: { element: <L.LinkButton href="/aide" label="Aide" /> },
  Logo: { element: <L.Logo /> },
  MetricCard: { element: <L.MetricCard label="Projets" value={3} /> },
  Modal: { element: <L.Modal open title="Fenêtre" onClose={noop}>Contenu</L.Modal> },
  MultiSelect: { element: <L.MultiSelect label="Membres" options={[{ value: 'a', label: 'Camille' }]} value={[]} onChange={noop} /> },
  NotificationCenter: { element: <L.NotificationCenter source={{ list: () => new Promise<never>(noop), markRead: async () => [] }} onClose={noop} /> },
  PageHeader: { element: <L.PageHeader title="Projets" /> },
  Pagination: { element: <L.Pagination page={1} pageSize={10} total={30} onChange={noop} /> },
  Panel: { element: <L.Panel title="Activité">Contenu</L.Panel> },
  PendingFeatureNotice: { element: <L.PendingFeatureNotice feature="Pièces jointes" /> },
  PriorityPill: { element: <L.PriorityPill level="high" /> },
  ProgressMeter: { element: <L.ProgressMeter label="Avancement" value={40} /> },
  RadioGroup: { element: <L.RadioGroup label="Thème" name="theme" options={[{ value: 'light', label: 'Clair' }]} /> },
  SegmentedControl: { element: <L.SegmentedControl label="Vue" value="a" onChange={noop} options={[{ key: 'a', label: 'Kanban' }]} /> },
  Select: { element: selectScene },
  SelectContent: { element: selectScene, root: false, open: openSelect },
  SelectField: { element: <L.SelectField label="Page d’accueil" options={[{ value: 'a', label: 'Tableau de bord' }]} value="" onChange={noop} /> },
  SelectGroup: { element: selectScene, root: false, open: openSelect },
  SelectItem: { element: selectScene, root: false, open: openSelect },
  SelectLabel: { element: selectScene, root: false, open: openSelect },
  SelectSeparator: { element: selectScene, root: false, open: openSelect },
  SelectTrigger: { element: selectScene, root: false },
  SelectValue: { element: selectScene, root: false },
  SessionExpiredNotice: { element: <L.SessionExpiredNotice loginHref="/login" /> },
  SessionList: { element: <L.SessionList sessions={[]} /> },
  Sidebar: { element: <L.Sidebar /> },
  Skeleton: { element: <L.Skeleton /> },
  Slider: { element: <L.Slider label="Taille" min={0} max={10} /> },
  Spinner: { element: <L.Spinner label="Chargement" /> },
  StatusBadge: { element: <L.StatusBadge status="active" /> },
  StatusPill: { element: <L.StatusPill label="Actif" /> },
  Switch: { element: <L.Switch label="Notifications" /> },
  Tabs: { element: <L.Tabs label="Paramètres" value="a" onChange={noop} items={[{ key: 'a', label: 'Profil' }]} /> },
  Tag: { element: <L.Tag label="Urgent" /> },
  TagList: { element: <L.TagList label="Étiquettes" items={['Urgent']} /> },
  Text: { element: <L.Text>Texte</L.Text> },
  TextArea: { element: <L.TextArea label="Description" /> },
  TextField: { element: <L.TextField label="Nom" /> },
  Toast: { element: <L.Toast message="Enregistré" /> },
  // The provider renders its children first, then its live regions: no single root.
  ToastProvider: { element: <L.ToastProvider regionLabel="Notifications"><p>Contenu</p></L.ToastProvider>, root: false },
  ToolTip: { element: <L.ToolTip text="Aide"><button type="button">?</button></L.ToolTip> },
  UserIdentity: { element: <L.UserIdentity name="Camille Martin" /> },
  ...Object.fromEntries(textPresets.map(name => { const Preset = L[name]; return [name, { element: <Preset>Texte</Preset> }]; })),
  ...Object.fromEntries(buttonPresets.map(name => { const Preset = L[name]; return [name, { element: <Preset /> }]; })),
  ...Object.fromEntries(fieldPresets.map(name => { const Preset = L[name]; return [name, { element: <Preset /> }]; })),
  ...Object.fromEntries(iconButtonPresets.map(name => { const Preset = L[name]; return [name, { element: <Preset /> }]; })),
  ...Object.fromEntries(alertPresets.map(name => { const Preset = L[name]; return [name, { element: <Preset /> }]; })),
  ...Object.fromEntries(['DropdownMenuCheckboxItem', 'DropdownMenuContent', 'DropdownMenuGroup', 'DropdownMenuItem', 'DropdownMenuLabel', 'DropdownMenuRadioGroup', 'DropdownMenuRadioItem', 'DropdownMenuSeparator', 'DropdownMenuShortcut', 'DropdownMenuSub', 'DropdownMenuSubContent', 'DropdownMenuSubTrigger', 'DropdownMenuTrigger']
    .map(name => [name, { element: menuScene, root: false }])),
};

const names = (element: Element | null) => (element?.getAttribute(COMPONENT_MARKER) ?? '').split(/\s+/).filter(Boolean);

describe('MAIR-318: lib component markers for the RGAA coverage report', () => {
  it('every exported component has a fixture here, or renders no element of its own', () => {
    expect(components.filter(name => !(name in fixtures) && !noElement.includes(name))).toEqual([]);
    expect(Object.keys(fixtures).filter(name => !components.includes(name))).toEqual([]);
  });

  it.each(components.filter(name => !noElement.includes(name)))('%s marks its root element', name => {
    const fixture = fixtures[name];
    const { container } = render(fixture.element);
    fixture.open?.(container);
    if (fixture.root !== false) expect(names(container.firstElementChild)).toContain(name);
    expect(document.body.querySelector(`[${COMPONENT_MARKER}~="${name}"]`)).not.toBeNull();
  });

  it('parts with no element of their own render nothing', () => {
    const { container } = render(<><P.SelectScrollUpButton /><P.SelectScrollDownButton /><P.DropdownMenuPortal>{null}</P.DropdownMenuPortal></>);
    expect(container.childElementCount).toBe(0);
  });

  it('a component rendered by another one lists both names, outermost first', () => {
    const { container: modal } = render(<L.ConfirmModal open title="Supprimer ?" message="Confirmer." onCancel={noop} onConfirm={noop} />);
    expect(names(modal.firstElementChild)).toEqual(['ConfirmModal', 'Modal']);
    const { container: save } = render(<L.SaveButton />);
    expect(names(save.firstElementChild)).toEqual(['SaveButton', 'Button']);
    const { container: email } = render(<L.EmailField />);
    expect(names(email.firstElementChild)).toEqual(['EmailField', 'TextField', 'Field']);
    const { container: caption } = render(<L.DateTime value={null} />);
    expect(names(caption.firstElementChild)).toEqual(['DateTime', 'Caption', 'Text']);
  });

  it('a consumer marker is kept in front, and an inner control does not repeat it', () => {
    const { container } = render(<L.TextField label="Nom" {...componentMarker('ProjectNameField')} />);
    expect(names(container.firstElementChild)).toEqual(['ProjectNameField', 'TextField', 'Field']);
    expect(container.querySelector('input')!.hasAttribute(COMPONENT_MARKER)).toBe(false);
    expect(componentMarker('Button', { [COMPONENT_MARKER]: 'SaveButton Button' })).toEqual({ [COMPONENT_MARKER]: 'SaveButton Button' });
  });

  it('TagList marks its empty-state root', () => {
    const { container } = render(<L.TagList label="Étiquettes" items={[]} emptyText="Aucune étiquette" />);
    expect(names(container.firstElementChild)).toContain('TagList');
  });

  it('an asChild item or trigger marks the child it renders: caller, component, then the child names', () => {
    const { container } = render(
      <P.DropdownMenu open onOpenChange={noop}>
        <P.DropdownMenuTrigger asChild {...componentMarker('ProjectMenu')}><span id="trigger">Menu</span></P.DropdownMenuTrigger>
        <P.DropdownMenuContent>
          <P.DropdownMenuItem asChild><a id="plain" href="#a">Ouvrir</a></P.DropdownMenuItem>
          <P.DropdownMenuItem asChild><a id="marked" href="#b" {...componentMarker('Inner')}>Lien</a></P.DropdownMenuItem>
        </P.DropdownMenuContent>
      </P.DropdownMenu>,
    );
    expect(names(container.querySelector('#trigger'))).toEqual(['ProjectMenu', 'DropdownMenuTrigger']);
    expect(names(container.ownerDocument.querySelector('#plain'))).toEqual(['DropdownMenuItem']);
    expect(names(container.ownerDocument.querySelector('#marked'))).toEqual(['DropdownMenuItem', 'Inner']);
  });
});
