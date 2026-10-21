/** Public module membership (MAIR-607: only components shared by several fronts).
 * Runtime exports remain explicit; private contexts are not exported by a module
 * barrel. Source-declared public types are retained. */
export const uiEntryPoints = {
  primitives: {
    components: ['Alert', 'Avatar', 'AvatarStack', 'Button', 'ButtonPresets', 'Card', 'Checkbox', 'ConfirmModal', 'DataState', 'DataTable', 'DateTime', 'Drawer', 'DropdownMenu', 'Field', 'FieldPresets', 'FileField', 'FilterSelect', 'FormActions', 'FormSection', 'Icon', 'IconButton', 'LinkButton', 'MetricCard', 'Modal', 'MultiSelect', 'PageHeader', 'Pagination', 'Panel', 'PendingFeatureNotice', 'ProgressMeter', 'RadioGroup', 'SegmentedControl', 'SelectField', 'SessionExpiredNotice', 'SessionList', 'Skeleton', 'Slider', 'Spinner', 'StatusPill', 'Switch', 'Tabs', 'Tag', 'Text', 'TextArea', 'TextField', 'Select', 'Toast', 'ToastProvider', 'ToolTip', 'UserIdentity'],
    extra: [
      "export { SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from '../components/Select';",
      "export { DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '../components/DropdownMenu';",
      "export { useToast } from '../components/ToastProvider';",
      "export { nextSessionExpiryDelay, sessionState } from '../components/SessionList';",
      "export { BackButton, CancelButton, CloseButton, ConfirmDeleteButton, CreateButton, DeleteButton, DownloadButton, EditButton, LogoutButton, RefreshButton, RetryButton, SaveButton, SendButton } from '../components/ButtonPresets';",
      "export { buttonAppearance, buttonSizing } from '../components/Button';",
      "export { DateField, EmailField, NameField, NumberField, PasswordField, PhoneField, SearchField } from '../components/FieldPresets';",
      "export { controlClass, controlStyle, fieldDescriptionIds } from '../components/Field';",
      "export { Body, BodySmall, Caption, ErrorText, Help, Label, Link, Metric, ModalTitle, Overline, PageTitle, PanelTitle, SectionTitle, TextPresets } from '../components/Text';",
      "export { AlertPresets, ErrorAlert, InfoAlert, SuccessAlert, UnavailableAlert, WarningAlert } from '../components/Alert';",
      "export { PriorityPill, StatusBadge, priorities, statuses } from '../components/StatusPill';",
      "export { TagList } from '../components/Tag';",
      "export { TOAST_DEFAULT_DURATION } from '../components/ToastProvider';",
      "export { formatDateTime, formatRelative, parseDateValue } from '../components/DateTime';",
      "export { paginationSummary } from '../components/Pagination';",
      "export { initialsOf } from '../components/Avatar';",
      "export { modalWidths, useDialogFocus } from '../components/Modal';",
      "export { drawerWidths } from '../components/Drawer';",
    ],
  },
  shell: {
    components: ['AppShell', 'AccessibleShell', 'CurrentDate', 'DesktopNavigation', 'Footer', 'Header', 'Logo', 'NotificationCenter', 'Sidebar'],
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
  "export { Body, BodySmall, Caption, ErrorText, Help, Label, Link, Metric, ModalTitle, Overline, PageTitle, PanelTitle, SectionTitle, TextPresets } from './components/Text';",
  "export { AlertPresets, ErrorAlert, InfoAlert, SuccessAlert, UnavailableAlert, WarningAlert } from './components/Alert';",
  "export { PriorityPill, StatusBadge, priorities, statuses } from './components/StatusPill';",
  "export { TagList } from './components/Tag';",
  "export { TOAST_DEFAULT_DURATION } from './components/ToastProvider';",
  "export { formatDateTime, formatRelative, parseDateValue } from './components/DateTime';",
  "export { paginationSummary } from './components/Pagination';",
  "export { initialsOf } from './components/Avatar';",
  "export { modalWidths, useDialogFocus } from './components/Modal';",
  "export { drawerWidths } from './components/Drawer';",
  "export type { SkeletonProps } from './components/Skeleton';",
  "export type { ToastProps, ToastVariant } from './components/Toast';",
  "export { useToast } from './components/ToastProvider';",
  "export type { ToastOptions, ToastContextValue, ToastProviderProps } from './components/ToastProvider';",
];
