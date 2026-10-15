/** Public module membership. Runtime exports remain explicit; private contexts
 * are not exported by a module barrel. Source-declared public types are retained. */
export const uiEntryPoints = {
  primitives: {
    components: ['Alert', 'Avatar', 'Badge', 'Button', 'Card', 'ConfirmModal', 'DropdownMenu', 'EmptyState', 'FileCard', 'InputManager', 'MiniCard', 'Paragraph', 'ProgressBar', 'Select', 'Skeleton', 'Spinner', 'Title', 'Toast', 'ToastProvider', 'ToolTip'],
    extra: [
      "export { SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from '../components/Select';",
      "export { DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '../components/DropdownMenu';",
      "export { useToast } from '../components/ToastProvider';",
    ],
  },
  settings: {
    components: ['SettingsModule', 'SettingsAppearancePanel', 'SettingsGeneralPanel', 'SettingsNotificationsPanel', 'SettingsProfilePanel', 'SettingsSecurityPanel', 'SettingsSystemPanel', 'SettingsTabs', 'UserProfile', 'UserProfilePage'],
    typeFiles: ['settings/types'],
  },
  dashboard: {
    components: ['DashboardModule', 'DashboardMetricCards', 'DashboardPendingTasks', 'DashboardPerformancePanel', 'DashboardQuickActions', 'DashboardRecentProjects', 'DashboardUpcomingEvents'],
    typeFiles: ['dashboard/types'],
  },
  projects: {
    components: ['ProjectModule', 'TaskStatusKanban', 'TaskStatusSelect', 'Item', 'ItemContainer', 'SortableItem'],
    typeFiles: ['projects/types'],
  },
  messages: {
    components: ['Messaging', 'MessagingChatHeader', 'MessagingComposer', 'MessagingContactAvatar', 'MessagingConversationItem', 'MessagingMessageBubble', 'MessagingSidebar', 'NewMessageModal', 'CreateGroupModal', 'EmailModule', 'EmailComposeModal', 'EmailDraftPrompt', 'EmailFolders', 'EmailMessageList', 'EmailReader'],
    typeFiles: ['messaging/types', 'email/types'],
  },
  calendar: {
    components: ['CalendarModule', 'CalendarCell', 'CalendarDateField', 'CalendarSidebar', 'CalendarToolbar', 'CreateEventModal', 'DaySchedule', 'EventAssigneeSelect', 'EventDetailsModal', 'MonthGrid', 'StatsPanel', 'UpcomingEventsPanel', 'ViewSwitcher', 'WeekGrid'],
    typeFiles: ['calendar/types'],
  },
  admin: {
    components: ['AdministrationModule', 'AdministrationAuditPanel', 'AdministrationLogsPanel', 'AdministrationMetricCards', 'AdministrationSelect', 'AdministrationSettingsPanel', 'AdministrationSystemPanel', 'AdministrationTabs', 'AdministrationUserFilters', 'AdministrationUserModal', 'AdministrationUsersTable'],
    typeFiles: ['administration/types'],
  },
  elearning: {
    components: ['ElearningCatalog', 'ElearningAdminStats', 'ElearningBadge', 'ElearningCourseCard', 'ElearningCourseDetailsModal', 'ElearningCourseFormModal', 'ElearningCourseRating', 'ElearningFilterSelect', 'ElearningSearchInput', 'ElearningStatCard'],
  },
  shell: {
    components: ['AppShell', 'DesktopNavigation', 'Footer', 'Header', 'NotificationCenter', 'PageTitleBar', 'Sidebar'],
    extra: [
      "export { defaultSidebarItems } from '../components/Sidebar';",
      "export { mairie360LogoSrc } from '../assets/logo';",
    ],
  },
};

// Preserve the historical root surface and its hook/type additions verbatim.
export const rootExtraExports = [
  "export { mairie360LogoSrc } from './assets/logo';",
  "export { defaultSidebarItems } from './components/Sidebar';",
  "export type { NotificationItem, NotificationSource } from './components/NotificationCenter';",
  "export type { AppShellProps } from './components/AppShell';",
  "export type { TaskStatusDefinition, TaskStatusSelectProps } from './components/TaskStatusSelect';",
  "export type { TaskStatusKanbanTask, TaskStatusKanbanProps } from './components/TaskStatusKanban';",
  "export type { SkeletonProps } from './components/Skeleton';",
  "export type { EmptyStateProps } from './components/EmptyState';",
  "export type { ToastProps, ToastVariant } from './components/Toast';",
  "export { useToast } from './components/ToastProvider';",
  "export type { ToastOptions, ToastContextValue, ToastProviderProps } from './components/ToastProvider';",
];
