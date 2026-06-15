import type React from 'react';

export type CalendarViewMode = 'month' | 'week' | 'day';

export type CalendarDateInput = Date | string;

export type CalendarAssigneeId = string | number;

export interface CalendarAssignee {
  id: CalendarAssigneeId;
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
}

export interface CalendarEvent {
  id: string | number;
  title: React.ReactNode;
  date: CalendarDateInput;
  startTime?: string;
  endTime?: string;
  description?: React.ReactNode;
  assigneeIds?: CalendarAssigneeId[];
  assignees?: CalendarAssignee[];
  colorClassName?: string;
  className?: string;
}

export interface CalendarStat {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface ViewSwitcherOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
}

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  children: React.ReactNode;
}

export interface PageTitleBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  action?: React.ReactNode;
  onAction?: () => void;
}

export interface ViewSwitcherProps<T extends string = string> {
  options: ViewSwitcherOption<T>[];
  value: T;
  onChange?: (value: T) => void;
  className?: string;
  'aria-label'?: string;
}

export interface CalendarToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  view: CalendarViewMode;
  viewOptions?: ViewSwitcherOption<CalendarViewMode>[];
  onViewChange?: (view: CalendarViewMode) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  previousLabel?: string;
  nextLabel?: string;
}

export interface CalendarCellProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  muted?: boolean;
  children?: React.ReactNode;
}

export interface MonthGridProps extends React.HTMLAttributes<HTMLDivElement> {
  currentDate: CalendarDateInput;
  selectedDate?: CalendarDateInput;
  events?: CalendarEvent[];
  weekStartsOn?: 0 | 1;
  dayLabels?: string[];
  onSelectDate?: (date: Date) => void;
}

export interface WeekGridProps extends React.HTMLAttributes<HTMLDivElement> {
  currentDate: CalendarDateInput;
  selectedDate?: CalendarDateInput;
  events?: CalendarEvent[];
  hours?: string[];
  weekStartsOn?: 0 | 1;
  dayLabels?: string[];
  onSelectDate?: (date: Date) => void;
  onSelectSlot?: (date: Date, time: string) => void;
}

export interface DayScheduleProps extends React.HTMLAttributes<HTMLDivElement> {
  currentDate: CalendarDateInput;
  events?: CalendarEvent[];
  hours?: string[];
  onSelectSlot?: (date: Date, time: string) => void;
}

export interface UpcomingEventsPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  events?: CalendarEvent[];
  title?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  showEmptyState?: boolean;
}

export interface StatsPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  stats: CalendarStat[];
  title?: React.ReactNode;
}

export interface CalendarSidebarProps extends React.HTMLAttributes<HTMLElement> {
  upcomingEvents?: CalendarEvent[];
  stats?: CalendarStat[];
  showEmptyState?: boolean;
}

export interface EventAssigneeSelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  people?: CalendarAssignee[];
  value?: CalendarAssigneeId[];
  onChange?: (assigneeIds: CalendarAssigneeId[]) => void;
  label?: React.ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: React.ReactNode;
  disabled?: boolean;
}

export interface CreateCalendarEventValues {
  title: string;
  description: string;
  date: string;
  category: string;
  startTime: string;
  endTime: string;
  location: string;
  assigneeIds: CalendarAssigneeId[];
}

export interface CalendarEventCategoryOption {
  label: string;
  value: string;
}

export interface CreateEventModalProps {
  isOpen: boolean;
  people?: CalendarAssignee[];
  categories?: CalendarEventCategoryOption[];
  initialValues?: Partial<CreateCalendarEventValues>;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  cancelLabel?: string;
  submitLabel?: string;
  onCancel: () => void;
  onCreate: (event: CreateCalendarEventValues) => void;
}
