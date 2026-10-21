/** Public module membership (MAIR-607: only components shared by several fronts).
 * Runtime exports remain explicit; private contexts are not exported by a module
 * barrel. Source-declared public types are retained. */
export const uiEntryPoints = {
  primitives: {
    components: ['Alert', 'Avatar', 'Badge', 'Button', 'ButtonPresets', 'Card', 'Checkbox', 'ConfirmModal', 'DropdownMenu', 'EmptyState', 'Field', 'FieldPresets', 'FileField', 'FilterSelect', 'FormActions', 'FormSection', 'Icon', 'IconButton', 'LinkButton', 'MultiSelect', 'Paragraph', 'RadioGroup', 'SelectField', 'Slider', 'Switch', 'TextArea', 'TextField', 'Select', 'SessionList', 'Skeleton', 'Spinner', 'Title', 'Toast', 'ToastProvider', 'ToolTip'],
    extra: [
      "export { SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from '../components/Select';",
      "export { DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '../components/DropdownMenu';",
      "export { useToast } from '../components/ToastProvider';",
      "export { nextSessionExpiryDelay, sessionState } from '../components/SessionList';",
      "export { BackButton, CancelButton, CloseButton, ConfirmDeleteButton, CreateButton, DeleteButton, DownloadButton, EditButton, LogoutButton, RefreshButton, RetryButton, SaveButton, SendButton } from '../components/ButtonPresets';",
      "export { buttonAppearance, buttonSizing } from '../components/Button';",
      "export { DateField, EmailField, NameField, NumberField, PasswordField, PhoneField, SearchField } from '../components/FieldPresets';",
      "export { controlClass, controlStyle, fieldDescriptionIds } from '../components/Field';",
    ],
  },
  shell: {
    components: ['AppShell', 'AccessibleShell', 'CurrentDate', 'DesktopNavigation', 'Footer', 'Header', 'Logo', 'NotificationCenter', 'PageTitleBar', 'Sidebar'],
    extra: [
      "export { defaultSidebarItems } from '../components/Sidebar';",
      "export { mairie360LogoSrc } from '../assets/logo';",
      "export { formatCurrentDate } from '../components/CurrentDate';",
      "export { SIDEBAR_COOKIE, configureSidebarCookieDomain, readSidebarPreference, sidebarPreferenceCookie, validSidebarCookieDomain } from '../utils/sidebar-preference';",
    ],
  },
};

// Preserve the historical root surface and its hook/type additions verbatim.
export const rootExtraExports = [
  "export { mairie360LogoSrc } from './assets/logo';",
  "export { defaultSidebarItems } from './components/Sidebar';",
  "export type { NotificationItem, NotificationSource } from './components/NotificationCenter';",
  "export type { AppShellProps } from './components/AppShell';",
  "export { nextSessionExpiryDelay, sessionState } from './components/SessionList';",
  "export { BackButton, CancelButton, CloseButton, ConfirmDeleteButton, CreateButton, DeleteButton, DownloadButton, EditButton, LogoutButton, RefreshButton, RetryButton, SaveButton, SendButton } from './components/ButtonPresets';",
  "export type { SessionListProps, SessionRecord, SessionState } from './components/SessionList';",
  "export { DateField, EmailField, NameField, NumberField, PasswordField, PhoneField, SearchField } from './components/FieldPresets';",
  "export type { SkeletonProps } from './components/Skeleton';",
  "export type { EmptyStateProps } from './components/EmptyState';",
  "export type { ToastProps, ToastVariant } from './components/Toast';",
  "export { useToast } from './components/ToastProvider';",
  "export type { ToastOptions, ToastContextValue, ToastProviderProps } from './components/ToastProvider';",
];
