import React from 'react';
import {
  AlertCircle,
  Ban,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  History,
  Kanban,
  LayoutGrid,
  ListChecks,
  ListTodo,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Table2,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

import { AdministrationSelect } from './AdministrationSelect';
import { joinClasses } from './calendar/style';
import {
  editableProjectPriorityOptions,
  editableProjectStatusOptions,
  projectPriorityOptions,
  projectStatusOptions,
} from './projects/options';
import type {
  Project,
  ProjectAction,
  ProjectFormValues,
  ProjectHistoryEntry,
  ProjectMember,
  ProjectPriority,
  ProjectPriorityMeta,
  ProjectSelectOption,
  ProjectStatus,
  ProjectStatusMeta,
  ProjectTag,
  ProjectTask,
  ProjectUserRole,
  ProjectViewMode,
} from './projects/types';

export interface ProjectModuleProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  projects?: Project[];
  members?: ProjectMember[];
  tags?: ProjectTag[];
  viewMode?: ProjectViewMode;
  defaultViewMode?: ProjectViewMode;
  currentUserId?: string;
  currentUserRole?: ProjectUserRole;
  teamMemberIds?: string[];
  onViewModeChange?: (viewMode: ProjectViewMode) => void;
  onCreateProject?: (values: ProjectFormValues) => void;
  onUpdateProject?: (project: Project) => void;
  onProjectAction?: (project: Project, action?: ProjectAction) => void;
  onSettingsClick?: () => void;
}

interface ProjectModalProps {
  isOpen: boolean;
  title: React.ReactNode;
  submitLabel: string;
  initialValues?: ProjectFormValues;
  members: ProjectMember[];
  tags: ProjectTag[];
  currentUserId?: string;
  canEditProjectFields: boolean;
  canManageTasks: boolean;
  canAssignEmployees: boolean;
  canUpdateAssignedTasks: boolean;
  onCancel: () => void;
  onSubmit: (values: ProjectFormValues) => void;
}

interface ProjectSelectProps<TValue extends string> {
  label: string;
  value: TValue;
  options: ProjectSelectOption<TValue>[];
  showLabel?: boolean;
  disabled?: boolean;
  onValueChange: (value: TValue) => void;
}

interface ProjectMultiSelectProps {
  label: string;
  value: string[];
  options: ProjectSelectOption[];
  placeholder: string;
  disabled?: boolean;
  onValueChange: (value: string[]) => void;
}

interface ProjectCardProps {
  project: Project;
  members: ProjectMember[];
  tags: ProjectTag[];
  canEditProject: boolean;
  canManageTasks: boolean;
  canDeleteProject: boolean;
  canCloseProject: boolean;
  onEdit: (project: Project) => void;
  onClose: (project: Project) => void;
  onDelete: (project: Project) => void;
  onAction?: (project: Project, action?: ProjectAction) => void;
}

const statusMeta: Record<ProjectStatus, ProjectStatusMeta> = {
  todo: {
    label: 'À faire',
    icon: AlertCircle,
    columnClassName: 'border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)]',
    badgeClassName: 'border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] text-[var(--mairie-muted)]',
    dotClassName: 'text-[var(--mairie-error-text)]',
  },
  'in-progress': {
    label: 'En cours',
    icon: Clock3,
    columnClassName: 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)]',
    badgeClassName: 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]',
    dotClassName: 'text-[var(--mairie-accent)]',
  },
  review: {
    label: 'En révision',
    icon: Eye,
    columnClassName: 'border-[var(--mairie-warning-text)] bg-[var(--mairie-warning-surface)]',
    badgeClassName: 'border-[var(--mairie-warning-text)] bg-[var(--mairie-warning-surface)] text-[var(--mairie-warning-text)]',
    dotClassName: 'text-[var(--mairie-accent)]',
  },
  done: {
    label: 'Terminé',
    icon: CheckCircle2,
    columnClassName: 'border-[var(--mairie-success-text)] bg-[var(--mairie-success-surface)]',
    badgeClassName: 'border-[var(--mairie-success-text)] bg-[var(--mairie-success-surface)] text-[var(--mairie-success-text)]',
    dotClassName: 'text-[var(--mairie-success-text)]',
  },
  suspended: {
    label: 'Suspendu',
    icon: Ban,
    columnClassName: 'border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)]',
    badgeClassName: 'border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] text-[var(--mairie-muted)]',
    dotClassName: 'text-[var(--mairie-muted)]',
  },
};

const priorityMeta: Record<ProjectPriority, ProjectPriorityMeta> = {
  high: {
    label: 'Haute',
    badgeClassName: 'bg-[var(--mairie-error-surface)] text-[var(--mairie-error-text)]',
    dotClassName: 'bg-[var(--mairie-error-action-background)]',
  },
  medium: {
    label: 'Moyenne',
    badgeClassName: 'bg-[var(--mairie-purple-surface)] text-[var(--mairie-purple-text)]',
    dotClassName: 'bg-[var(--mairie-purple-text)]',
  },
  low: {
    label: 'Basse',
    badgeClassName: 'border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] text-[var(--mairie-muted)]',
    dotClassName: 'bg-[var(--mairie-muted)]',
  },
};

const tagClassNames: Record<ProjectTag['tone'], string> = {
  blue: 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]',
  green: 'border-[var(--mairie-success-text)] bg-[var(--mairie-success-surface)] text-[var(--mairie-success-text)]',
  red: 'border-[var(--mairie-error-text)] bg-[var(--mairie-error-surface)] text-[var(--mairie-error-text)]',
  purple: 'border-[var(--mairie-purple-text)] bg-[var(--mairie-purple-surface)] text-[var(--mairie-purple-text)]',
  gray: 'border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] text-[var(--mairie-muted)]',
};

const statusOrder: ProjectStatus[] = ['todo', 'in-progress', 'review', 'done', 'suspended'];

const viewOptions: Array<{ value: ProjectViewMode; label: string; icon: LucideIcon }> = [
  { value: 'kanban', label: 'Kanban', icon: Kanban },
  { value: 'grid', label: 'Grille', icon: LayoutGrid },
  { value: 'table', label: 'Table', icon: Table2 },
];

const fieldClassName =
  'h-9 w-full rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 text-sm text-[var(--mairie-text)] outline-none transition placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20 disabled:cursor-not-allowed disabled:opacity-70';

const textareaClassName =
  'min-h-[210px] w-full resize-none rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 py-3 text-sm text-[var(--mairie-text)] outline-none transition placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20 disabled:cursor-not-allowed disabled:opacity-70';

const defaultProjectFormValues: ProjectFormValues = {
  title: '',
  objectives: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  ownerId: '',
  assigneeIds: [],
  tagIds: [],
  dueDate: '',
  progress: 0,
  tasks: [],
  history: [],
};

const normalizeSearch = (value: string) =>
  value
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const clampProgress = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const getCompletedTaskCount = (tasks: ProjectTask[]) => tasks.filter((task) => task.status === 'done').length;

const getMember = (members: ProjectMember[], memberId: string) => members.find((member) => member.id === memberId);

const getTag = (tags: ProjectTag[], tagId: string) => tags.find((tag) => tag.id === tagId);

const getTaskComments = (task: ProjectTask) => task.comments ?? [];

const getProjectHistory = (project: Project) => project.history ?? [];

const getProjectAccessScope = (
  project: Project,
  currentUserRole?: ProjectUserRole,
  currentUserId?: string,
  teamMemberIds: string[] = []
) => {
  if (currentUserRole === 'mayor') return true;
  if (!currentUserRole || !currentUserId) return false;

  if (currentUserRole === 'employee') {
    return project.assigneeIds.includes(currentUserId) || project.tasks.some((task) => task.assigneeIds.includes(currentUserId));
  }

  const teamScope = new Set([currentUserId, ...teamMemberIds]);

  return (
    project.ownerId === currentUserId ||
    project.assigneeIds.some((assigneeId) => teamScope.has(assigneeId)) ||
    project.tasks.some((task) => task.assigneeIds.some((assigneeId) => teamScope.has(assigneeId)))
  );
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

const formatShortDate = (date: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${date}T00:00:00`));

const truncate = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1).trim()}…` : value;

const getProjectFormValues = (project: Project): ProjectFormValues => ({
  title: project.title,
  objectives: project.objectives ?? project.description,
  description: project.description,
  status: project.status,
  priority: project.priority,
  ownerId: project.ownerId,
  assigneeIds: project.assigneeIds,
  tagIds: project.tagIds,
  dueDate: project.dueDate,
  progress: project.progress,
  tasks: project.tasks,
  history: getProjectHistory(project),
});

const buildProjectFromValues = (values: ProjectFormValues, sequence: number, id: string): Project => ({
  id,
  sequence,
  title: values.title,
  objectives: values.objectives,
  description: values.description,
  status: values.status,
  priority: values.priority,
  ownerId: values.ownerId,
  assigneeIds: values.assigneeIds,
  tagIds: values.tagIds,
  dueDate: values.dueDate,
  progress: clampProgress(values.progress),
  tasks: values.tasks,
  history: values.history,
});

const statusOptionsForSelect = projectStatusOptions.map((option) => ({
  value: option.value,
  label: option.label,
}));

const priorityOptionsForSelect = projectPriorityOptions.map((option) => ({
  value: option.value,
  label: option.label,
}));

const ProjectSearchInput = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <div className="relative w-full min-w-0 sm:max-w-[448px]">
    <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--mairie-muted)]" />
    <input
      type="search"
      value={value}
      placeholder="Rechercher des projets..."
      className="h-10 w-full rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] pl-11 pr-4 text-sm text-[var(--mairie-text)] shadow-sm outline-none transition placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20"
      onChange={(event) => onValueChange(event.target.value)}
    />
  </div>
);

const ProjectSelect = <TValue extends string>({
  label,
  value,
  options,
  showLabel = false,
  disabled = false,
  onValueChange,
}: ProjectSelectProps<TValue>) => (
  <div className={showLabel ? 'space-y-1' : ''}>
    {showLabel && <div className="text-xs font-semibold text-[var(--mairie-muted)]">{label}</div>}
    <AdministrationSelect
      ariaLabel={label}
      value={value}
      options={options}
      triggerClassName="h-10 min-w-[160px] text-base sm:text-sm"
      menuClassName="min-w-[190px]"
      disabled={disabled}
      onValueChange={(nextValue) => onValueChange(nextValue as TValue)}
    />
  </div>
);

const ProjectDueDateFilter = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <div className="flex min-w-[180px] items-center gap-2 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-3 shadow-sm focus-within:border-[var(--mairie-accent)] focus-within:ring-2 focus-within:ring-[var(--mairie-accent)]/20">
    <Calendar className="size-4 shrink-0 text-[var(--mairie-muted)]" strokeWidth={1.8} />
    <input
      type="date"
      aria-label="Filtrer par échéance"
      value={value}
      className="h-10 w-full bg-transparent text-sm text-[var(--mairie-text)] outline-none"
      onChange={(event) => onValueChange(event.target.value)}
    />
    {value && (
      <button
        type="button"
        aria-label="Réinitialiser le filtre d'échéance"
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-[var(--mairie-muted)] transition hover:bg-[var(--mairie-surface-raised)] hover:text-[var(--mairie-text)]"
        onClick={() => onValueChange('')}
      >
        <X className="size-3.5" strokeWidth={1.8} />
      </button>
    )}
  </div>
);

const ProjectViewSwitcher = ({
  value,
  onValueChange,
}: {
  value: ProjectViewMode;
  onValueChange: (value: ProjectViewMode) => void;
}) => (
  <div
    role="tablist"
    aria-label="Vue des projets"
    className="inline-flex rounded-lg bg-[var(--mairie-surface-raised)] p-1 text-sm font-medium text-[var(--mairie-text)]"
  >
    {viewOptions.map((option) => {
      const Icon = option.icon;
      const selected = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={selected}
          className={joinClasses(
            'inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/30',
            selected ? 'bg-[var(--mairie-surface)] shadow-sm' : 'hover:bg-[var(--mairie-surface)]/60'
          )}
          onClick={() => onValueChange(option.value)}
        >
          <Icon className="size-4" strokeWidth={1.9} />
          <span>{option.label}</span>
        </button>
      );
    })}
  </div>
);

const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <span
      className={joinClasses(
        'inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs font-semibold leading-none',
        meta.badgeClassName
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.8} />
      {meta.label}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: ProjectPriority }) => (
  <span
    className={joinClasses(
      'inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold leading-none',
      priorityMeta[priority].badgeClassName
    )}
  >
    {priorityMeta[priority].label}
  </span>
);

const ProjectTagPill = ({ tag }: { tag: ProjectTag }) => (
  <span
    className={joinClasses(
      'inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-semibold leading-none',
      tagClassNames[tag.tone]
    )}
  >
    {tag.label}
  </span>
);

const MemberAvatarStack = ({
  members,
  ids,
  max = 3,
}: {
  members: ProjectMember[];
  ids: string[];
  max?: number;
}) => {
  const visibleMembers = ids.map((id) => getMember(members, id)).filter(Boolean) as ProjectMember[];

  if (visibleMembers.length === 0) {
    return <span className="text-xs text-[var(--mairie-muted)]">Non assigné</span>;
  }

  return (
    <div className="flex items-center">
      {visibleMembers.slice(0, max).map((member, index) => (
        <span
          key={member.id}
          title={member.name}
          className={joinClasses(
            'inline-flex size-5 items-center justify-center rounded-full border border-[var(--mairie-surface)] bg-[var(--mairie-action-background)] text-[10px] font-semibold leading-none text-[var(--mairie-on-action)] shadow-sm',
            index > 0 && '-ml-1.5'
          )}
        >
          {member.initials}
        </span>
      ))}
      {visibleMembers.length > max && (
        <span className="-ml-1.5 inline-flex size-5 items-center justify-center rounded-full border border-[var(--mairie-surface)] bg-[var(--mairie-surface-raised)] text-[10px] font-semibold leading-none text-[var(--mairie-text)]">
          +{visibleMembers.length - max}
        </span>
      )}
    </div>
  );
};

const ProgressLine = ({ progress }: { progress: number }) => {
  const resolvedProgress = clampProgress(progress);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="text-[var(--mairie-muted)]">Progression</span>
        <span className="font-bold text-[var(--mairie-text)]">{resolvedProgress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--mairie-surface-raised)]">
        <div className="h-full rounded-full bg-[var(--mairie-action-background)]" style={{ width: `${resolvedProgress}%` }} />
      </div>
    </div>
  );
};

const ProjectActionMenu = ({
  project,
  canEditProject,
  canDeleteProject,
  canCloseProject,
  onEdit,
  onClose,
  onDelete,
  onAction,
}: {
  project: Project;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canCloseProject: boolean;
  onEdit: (project: Project) => void;
  onClose: (project: Project) => void;
  onDelete: (project: Project) => void;
  onAction?: (project: Project, action?: ProjectAction) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleAction = (action: ProjectAction) => {
    if (action !== 'delete') onAction?.(project, action);
    if (action === 'open' || action === 'edit') onEdit(project);
    if (action === 'close') onClose(project);
    if (action === 'delete') onDelete(project);
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Actions pour ${project.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex size-8 items-center justify-center rounded-md text-[var(--mairie-muted)] transition hover:bg-[var(--mairie-surface-raised)] hover:text-[var(--mairie-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <MoreHorizontal className="size-4" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1 w-36 overflow-hidden rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-1 text-sm text-[var(--mairie-text)] shadow-[var(--mairie-shadow)]"
        >
          <button
            type="button"
            role="menuitem"
            className="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left hover:bg-[var(--mairie-surface-raised)]"
            onClick={() => handleAction('open')}
          >
            <Eye className="size-4" strokeWidth={1.8} />
            Ouvrir
          </button>
          {canEditProject && (
            <button
              type="button"
              role="menuitem"
              className="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left hover:bg-[var(--mairie-surface-raised)]"
              onClick={() => handleAction('edit')}
            >
              <Pencil className="size-4" strokeWidth={1.8} />
              Modifier
            </button>
          )}
          {canCloseProject && project.status !== 'done' && (
            <button
              type="button"
              role="menuitem"
              className="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left hover:bg-[var(--mairie-surface-raised)]"
              onClick={() => handleAction('close')}
            >
              <CheckCircle2 className="size-4" strokeWidth={1.8} />
              Clôturer
            </button>
          )}
          {canDeleteProject && (
            <button
              type="button"
              role="menuitem"
              className="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-[var(--mairie-error-text)] hover:bg-[var(--mairie-error-surface)]"
              onClick={() => handleAction('delete')}
            >
              <X className="size-4" strokeWidth={1.8} />
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({
  project,
  members,
  tags,
  canEditProject,
  canManageTasks,
  canDeleteProject,
  canCloseProject,
  onEdit,
  onClose,
  onDelete,
  onAction,
}: ProjectCardProps) => {
  const owner = getMember(members, project.ownerId);
  const completedTasks = getCompletedTaskCount(project.tasks);
  const projectTags = project.tagIds.map((tagId) => getTag(tags, tagId)).filter(Boolean) as ProjectTag[];

  return (
    <article className="flex h-[344px] flex-col overflow-hidden rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-3.5 text-[var(--mairie-text)] shadow-[var(--mairie-shadow)]">
      <div className="flex items-start gap-3">
        <Circle className="mt-1 size-4 shrink-0 text-[var(--mairie-success-text)]" strokeWidth={2.2} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold leading-5 text-[var(--mairie-text)]">{project.title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-[var(--mairie-muted)]">Mairie360 / projets #{project.sequence}</p>
        </div>
        <ProjectActionMenu
          project={project}
          canEditProject={canEditProject}
          canDeleteProject={canDeleteProject}
          canCloseProject={canCloseProject}
          onEdit={onEdit}
          onClose={onClose}
          onDelete={onDelete}
          onAction={onAction}
        />
      </div>

      <p className="mt-3 min-h-[48px] line-clamp-2 text-sm leading-6 text-[var(--mairie-muted)]">
        {project.description}
      </p>

      <div className="mt-3 flex min-h-[22px] max-h-[46px] flex-wrap gap-1.5 overflow-hidden">
        {projectTags.map((tag) => (
          <ProjectTagPill key={tag.id} tag={tag} />
        ))}
      </div>

      <div className="mt-4">
        <ProgressLine progress={project.progress} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-[var(--mairie-muted)]">
        <div className="min-w-0">
          <StatusBadge status={project.status} />
        </div>
        <div className="flex min-w-0 justify-end">
          <PriorityBadge priority={project.priority} />
        </div>
        <div className="flex items-center gap-1.5">
          <ListChecks className="size-3.5" strokeWidth={1.8} />
          <span>
            {completedTasks}/{project.tasks.length} tâches
          </span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <Calendar className="size-3.5" strokeWidth={1.8} />
          <span>{formatShortDate(project.dueDate)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <MemberAvatarStack members={members} ids={project.assigneeIds} />
          {owner && <span className="truncate text-sm text-[var(--mairie-muted)]">{owner.name}</span>}
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--mairie-muted)]">
          <Users className="size-3.5" strokeWidth={1.8} />
          <span>{project.assigneeIds.length}</span>
        </div>
      </div>

      <div className="mt-auto pt-2">
        <button
          type="button"
          className="inline-flex h-8 w-full items-center justify-start gap-2 rounded-md border border-dashed border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 text-sm font-medium text-[var(--mairie-muted)] transition hover:border-[var(--mairie-accent)]/40 hover:bg-[var(--mairie-accent-surface)] hover:text-[var(--mairie-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
          onClick={() => onEdit(project)}
        >
          <Plus className="size-4" strokeWidth={1.9} />
          {canManageTasks ? 'Ajouter une tâche' : 'Voir les tâches'}
        </button>
      </div>
    </article>
  );
};

const KanbanView = ({
  projects,
  members,
  tags,
  canEditProject,
  canManageTasks,
  canDeleteProject,
  canCloseProject,
  onEdit,
  onClose,
  onDelete,
  onAction,
}: {
  projects: Project[];
  members: ProjectMember[];
  tags: ProjectTag[];
  canEditProject: boolean;
  canManageTasks: boolean;
  canDeleteProject: boolean;
  canCloseProject: boolean;
  onEdit: (project: Project) => void;
  onClose: (project: Project) => void;
  onDelete: (project: Project) => void;
  onAction?: (project: Project, action?: ProjectAction) => void;
}) => {
  const visibleStatusOrder = statusOrder.filter(
    (status) => status !== 'suspended' || projects.some((project) => project.status === 'suspended')
  );

  return (
    <div className="grid gap-6 xl:grid-cols-4">
      {visibleStatusOrder.map((status) => {
      const columnProjects = projects.filter((project) => project.status === status);
      const meta = statusMeta[status];
      const Icon = meta.icon;

      return (
        <section key={status} className="min-w-0 space-y-3">
          <div
            className={joinClasses(
              'flex h-12 items-center justify-between rounded-md border px-3 text-sm font-bold text-[var(--mairie-text)]',
              meta.columnClassName
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <Icon className={joinClasses('size-4 shrink-0', meta.dotClassName)} strokeWidth={1.9} />
              <span className="truncate">{meta.label}</span>
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--mairie-surface-raised)] text-xs text-[var(--mairie-muted)]">
                {columnProjects.length}
              </span>
            </div>
            <button
              type="button"
              aria-label={`Ajouter dans ${meta.label}`}
              className="inline-flex size-7 items-center justify-center rounded-md text-[var(--mairie-muted)] transition hover:bg-[var(--mairie-surface)] hover:text-[var(--mairie-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
            >
              <Plus className="size-4" strokeWidth={1.9} />
            </button>
          </div>

          <div className="space-y-3">
            {columnProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                members={members}
                tags={tags}
                canEditProject={canEditProject}
                canManageTasks={canManageTasks}
                canDeleteProject={canDeleteProject}
                canCloseProject={canCloseProject}
                onEdit={onEdit}
                onClose={onClose}
                onDelete={onDelete}
                onAction={onAction}
              />
            ))}
          </div>
        </section>
      );
      })}
    </div>
  );
};

const GridView = ({
  projects,
  members,
  tags,
  canEditProject,
  canManageTasks,
  canDeleteProject,
  canCloseProject,
  onEdit,
  onClose,
  onDelete,
  onAction,
}: {
  projects: Project[];
  members: ProjectMember[];
  tags: ProjectTag[];
  canEditProject: boolean;
  canManageTasks: boolean;
  canDeleteProject: boolean;
  canCloseProject: boolean;
  onEdit: (project: Project) => void;
  onClose: (project: Project) => void;
  onDelete: (project: Project) => void;
  onAction?: (project: Project, action?: ProjectAction) => void;
}) => (
  <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
    {projects.map((project) => (
      <ProjectCard
        key={project.id}
        project={project}
        members={members}
        tags={tags}
        canEditProject={canEditProject}
        canManageTasks={canManageTasks}
        canDeleteProject={canDeleteProject}
        canCloseProject={canCloseProject}
        onEdit={onEdit}
        onClose={onClose}
        onDelete={onDelete}
        onAction={onAction}
      />
    ))}
  </div>
);

const TableView = ({
  projects,
  members,
  tags,
  canEditProject,
  canDeleteProject,
  canCloseProject,
  onEdit,
  onClose,
  onDelete,
  onAction,
}: {
  projects: Project[];
  members: ProjectMember[];
  tags: ProjectTag[];
  canEditProject: boolean;
  canDeleteProject: boolean;
  canCloseProject: boolean;
  onEdit: (project: Project) => void;
  onClose: (project: Project) => void;
  onDelete: (project: Project) => void;
  onAction?: (project: Project, action?: ProjectAction) => void;
}) => (
  <div className="overflow-hidden rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full text-left text-sm text-[var(--mairie-text)]">
        <thead className="border-b border-[var(--mairie-border)] bg-[var(--mairie-surface)] text-base font-bold text-[var(--mairie-text)]">
          <tr>
            <th className="px-5 py-4">Projet</th>
            <th className="px-5 py-4">Statut</th>
            <th className="px-5 py-4">Responsable</th>
            <th className="px-5 py-4">Priorité</th>
            <th className="px-5 py-4">Progression</th>
            <th className="px-5 py-4">Échéance</th>
            <th className="px-5 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const owner = getMember(members, project.ownerId);
            const projectTags = project.tagIds.map((tagId) => getTag(tags, tagId)).filter(Boolean) as ProjectTag[];

            return (
              <tr key={project.id} className="border-b border-[var(--mairie-border)] last:border-b-0">
                <td className="max-w-[360px] px-5 py-4">
                  <div className="font-bold leading-5 text-[var(--mairie-text)]">{project.title}</div>
                  <div className="mt-1 truncate text-sm leading-5 text-[var(--mairie-muted)]">{truncate(project.description, 68)}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5 lg:hidden">
                    {projectTags.map((tag) => (
                      <ProjectTagPill key={tag.id} tag={tag} />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <MemberAvatarStack members={members} ids={[project.ownerId]} max={1} />
                    <span className="whitespace-nowrap">{owner?.name ?? 'Non assigné'}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <PriorityBadge priority={project.priority} />
                </td>
                <td className="w-[180px] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--mairie-surface-raised)]">
                      <div
                        className="h-full rounded-full bg-[var(--mairie-action-background)]"
                        style={{ width: `${clampProgress(project.progress)}%` }}
                      />
                    </div>
                    <span className="w-10 text-xs font-bold text-[var(--mairie-text)]">{clampProgress(project.progress)}%</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-[var(--mairie-muted)]">{formatDate(project.dueDate)}</td>
                <td className="px-5 py-4">
                  <ProjectActionMenu
                    project={project}
                    canEditProject={canEditProject}
                    canDeleteProject={canDeleteProject}
                    canCloseProject={canCloseProject}
                    onEdit={onEdit}
                    onClose={onClose}
                    onDelete={onDelete}
                    onAction={onAction}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const ProjectMultiSelect = ({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onValueChange,
}: ProjectMultiSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selectedOptions = options.filter((option) => value.includes(option.value));

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const toggleValue = (optionValue: string) => {
    if (disabled) return;

    if (value.includes(optionValue)) {
      onValueChange(value.filter((currentValue) => currentValue !== optionValue));
      return;
    }

    onValueChange([...value, optionValue]);
  };

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1 block text-xs font-semibold text-[var(--mairie-muted)]">{label}</label>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        className="flex min-h-9 w-full items-center justify-between gap-3 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 py-2 text-left text-sm text-[var(--mairie-text)] outline-none transition focus-visible:border-[var(--mairie-accent)] focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <span className={selectedOptions.length ? 'text-[var(--mairie-text)]' : 'text-[var(--mairie-muted)]'}>
          {selectedOptions.length ? `${selectedOptions.length} sélectionné(s)` : placeholder}
        </span>
        <Check className={joinClasses('size-4 shrink-0 transition', selectedOptions.length ? 'text-[var(--mairie-teal-text)]' : 'text-[var(--mairie-muted)]')} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-1 text-sm text-[var(--mairie-text)] shadow-[var(--mairie-shadow)]"
        >
          {options.map((option) => {
            const selected = value.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={joinClasses(
                  'flex h-8 w-full items-center justify-between gap-2 rounded-sm px-2 text-left transition hover:bg-[var(--mairie-surface-raised)]',
                  selected && 'bg-[var(--mairie-surface-raised)] text-[var(--mairie-teal-text)]'
                )}
                onClick={() => toggleValue(option.value)}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {selected && <Check className="size-4 shrink-0" strokeWidth={1.8} />}
              </button>
            );
          })}
        </div>
      )}

      {selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className="inline-flex h-6 items-center gap-1 rounded-full border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-2 text-xs text-[var(--mairie-text)] transition hover:border-[var(--mairie-accent)]/35 hover:text-[var(--mairie-accent)]"
              disabled={disabled}
              onClick={() => toggleValue(option.value)}
            >
              {option.label}
              <X className="size-3" strokeWidth={1.8} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectFieldPanel = ({
  values,
  members,
  tags,
  memberOptions,
  ownerOptions,
  tagOptions,
  canEditProjectFields,
  canAssignEmployees,
  onValueChange,
}: {
  values: ProjectFormValues;
  members: ProjectMember[];
  tags: ProjectTag[];
  memberOptions: ProjectSelectOption[];
  ownerOptions: ProjectSelectOption[];
  tagOptions: ProjectSelectOption[];
  canEditProjectFields: boolean;
  canAssignEmployees: boolean;
  onValueChange: (nextValues: ProjectFormValues) => void;
}) => {
  const completedTasks = getCompletedTaskCount(values.tasks);
  const owner = getMember(members, values.ownerId);
  const selectedTags = values.tagIds.map((tagId) => getTag(tags, tagId)).filter(Boolean) as ProjectTag[];

  return (
    <aside className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-4">
      <h3 className="text-base font-bold leading-6 text-[var(--mairie-text)]">Champs du projet</h3>
      <p className="text-xs leading-5 text-[var(--mairie-muted)]">Configure les champs visibles sur les cartes.</p>

      <div className="mt-4 space-y-4">
        <ProjectSelect
          label="Statut"
          value={values.status}
          options={editableProjectStatusOptions}
          showLabel
          disabled={!canEditProjectFields}
          onValueChange={(status) => onValueChange({ ...values, status })}
        />
        <ProjectSelect
          label="Priorité"
          value={values.priority}
          options={editableProjectPriorityOptions}
          showLabel
          disabled={!canEditProjectFields}
          onValueChange={(priority) => onValueChange({ ...values, priority })}
        />
        <ProjectSelect
          label="Assigné principal"
          value={values.ownerId}
          options={ownerOptions}
          showLabel
          disabled={!canAssignEmployees}
          onValueChange={(ownerId) =>
            onValueChange({
              ...values,
              ownerId,
              assigneeIds: ownerId && !values.assigneeIds.includes(ownerId) ? [ownerId, ...values.assigneeIds] : values.assigneeIds,
            })
          }
        />
        <ProjectMultiSelect
          label="Assignés"
          value={values.assigneeIds}
          options={memberOptions}
          placeholder="Choisir un ou plusieurs assignés"
          disabled={!canAssignEmployees}
          onValueChange={(assigneeIds) => onValueChange({ ...values, assigneeIds })}
        />
        <ProjectMultiSelect
          label="Étiquettes"
          value={values.tagIds}
          options={tagOptions}
          placeholder="Choisir une ou plusieurs étiquettes"
          disabled={!canEditProjectFields}
          onValueChange={(tagIds) => onValueChange({ ...values, tagIds })}
        />
        <div>
          <label htmlFor="project-due-date" className="mb-1 block text-xs font-semibold text-[var(--mairie-muted)]">
            Échéance <span className="text-[var(--mairie-error-text)]">*</span>
          </label>
          <input
            id="project-due-date"
            type="date"
            value={values.dueDate}
            className={fieldClassName}
            disabled={!canEditProjectFields}
            onChange={(event) => onValueChange({ ...values, dueDate: event.target.value })}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--mairie-muted)]">Progression</span>
            <span className="font-bold text-[var(--mairie-text)]">{clampProgress(values.progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--mairie-surface-raised)]">
            <div className="h-full rounded-full bg-[var(--mairie-action-background)]" style={{ width: `${clampProgress(values.progress)}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-3">
              <div className="text-xs font-semibold text-[var(--mairie-muted)]">Terminées</div>
              <div className="mt-2 text-lg font-bold text-[var(--mairie-text)]">{completedTasks}</div>
            </div>
            <div className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-3">
              <div className="text-xs font-semibold text-[var(--mairie-muted)]">Total</div>
              <div className="mt-2 text-lg font-bold text-[var(--mairie-text)]">{values.tasks.length}</div>
            </div>
          </div>
        </div>

        {(owner || selectedTags.length > 0) && (
          <div className="space-y-2 rounded-md bg-[var(--mairie-surface-raised)] p-3 text-xs text-[var(--mairie-muted)]">
            {owner && (
              <div className="flex items-center gap-2">
                <Users className="size-3.5" />
                <span>{owner.name}</span>
              </div>
            )}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <ProjectTagPill key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

const ProjectTaskEditor = ({
  values,
  members,
  tags,
  memberOptions,
  tagOptions,
  currentUserId,
  canManageTasks,
  onValueChange,
}: {
  values: ProjectFormValues;
  members: ProjectMember[];
  tags: ProjectTag[];
  memberOptions: ProjectSelectOption[];
  tagOptions: ProjectSelectOption[];
  currentUserId?: string;
  canManageTasks: boolean;
  onValueChange: (nextValues: ProjectFormValues) => void;
}) => {
  const fallbackTaskAssigneeId = values.ownerId || currentUserId || '';
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [taskSearchValue, setTaskSearchValue] = React.useState('');
  const [taskStatusValue, setTaskStatusValue] = React.useState<ProjectStatus | 'all'>('all');
  const [taskPriorityValue, setTaskPriorityValue] = React.useState<ProjectPriority | 'all'>('all');
  const [taskDueDateValue, setTaskDueDateValue] = React.useState('');
  const [commentDrafts, setCommentDrafts] = React.useState<Record<string, string>>({});
  const [draftTask, setDraftTask] = React.useState<ProjectTask>({
    id: 'task-draft',
    title: '',
    status: 'todo',
    priority: 'medium',
    dueDate: values.dueDate,
    assigneeIds: fallbackTaskAssigneeId ? [fallbackTaskAssigneeId] : [],
    tagIds: [],
  });
  const normalizedTaskQuery = normalizeSearch(taskSearchValue);
  const canUpdateTask = (task: ProjectTask) => canManageTasks || Boolean(currentUserId && task.assigneeIds.includes(currentUserId));
  const canCommentTask = canUpdateTask;
  const visibleTasks = values.tasks.filter((task) => {
    const matchesRoleScope = canManageTasks || Boolean(currentUserId && task.assigneeIds.includes(currentUserId));
    const taskTags = task.tagIds.map((tagId) => getTag(tags, tagId)?.label).filter(Boolean).join(' ');
    const taskAssignees = task.assigneeIds.map((assigneeId) => getMember(members, assigneeId)?.name).filter(Boolean).join(' ');
    const taskComments = getTaskComments(task)
      .map((comment) => comment.message)
      .join(' ');
    const searchable = normalizeSearch(`${task.title} ${taskTags} ${taskAssignees} ${taskComments}`);
    const matchesSearch = normalizedTaskQuery.length === 0 || searchable.includes(normalizedTaskQuery);
    const matchesStatus = taskStatusValue === 'all' || task.status === taskStatusValue;
    const matchesPriority = taskPriorityValue === 'all' || task.priority === taskPriorityValue;
    const matchesDueDate = !taskDueDateValue || task.dueDate <= taskDueDateValue;

    return matchesRoleScope && matchesSearch && matchesStatus && matchesPriority && matchesDueDate;
  });

  React.useEffect(() => {
    setDraftTask((currentTask) => ({
      ...currentTask,
      dueDate: currentTask.dueDate || values.dueDate,
      assigneeIds: currentTask.assigneeIds.length > 0 ? currentTask.assigneeIds : fallbackTaskAssigneeId ? [fallbackTaskAssigneeId] : [],
    }));
  }, [fallbackTaskAssigneeId, values.dueDate]);

  const resetDraftTask = () => {
    setEditingTaskId(null);
    setDraftTask({
      id: 'task-draft',
      title: '',
      status: 'todo',
      priority: 'medium',
      dueDate: values.dueDate,
      assigneeIds: fallbackTaskAssigneeId ? [fallbackTaskAssigneeId] : [],
      tagIds: [],
    });
  };

  const commitTaskChange = (nextTasks: ProjectTask[]) => {
    onValueChange({
      ...values,
      tasks: nextTasks,
    });
  };

  const handleSubmitTask = () => {
    if (!canManageTasks) return;

    const trimmedTitle = draftTask.title.trim();
    if (!trimmedTitle) return;

    if (editingTaskId) {
      commitTaskChange(
        values.tasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...draftTask,
                id: editingTaskId,
                title: trimmedTitle,
              }
            : task
        )
      );
      resetDraftTask();
      return;
    }

    commitTaskChange(
      [
        ...values.tasks,
        {
          ...draftTask,
          id: `task-${Date.now()}`,
          title: trimmedTitle,
        },
      ]
    );
    resetDraftTask();
  };

  const handleEditTask = (task: ProjectTask) => {
    if (!canManageTasks) return;

    setEditingTaskId(task.id);
    setDraftTask(task);
  };

  const handleTaskStatusChange = (task: ProjectTask, status: ProjectStatus) => {
    if (!canUpdateTask(task)) return;

    commitTaskChange(
      values.tasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              status,
            }
          : currentTask
      )
    );
  };

  const handleToggleTask = (task: ProjectTask) => {
    handleTaskStatusChange(task, task.status === 'done' ? 'todo' : 'done');
  };

  const handleRemoveTask = (task: ProjectTask) => {
    if (!canManageTasks) return;

    commitTaskChange(
      values.tasks.filter((currentTask) => currentTask.id !== task.id)
    );
  };

  const handleCommentTask = (task: ProjectTask) => {
    if (!canCommentTask(task)) return;

    const message = (commentDrafts[task.id] ?? '').trim();
    if (!message) return;

    commitTaskChange(
      values.tasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              comments: [
                ...getTaskComments(currentTask),
                {
                  id: `comment-${Date.now()}`,
                  authorId: currentUserId,
                  message,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : currentTask
      )
    );
    setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [task.id]: '' }));
  };

  return (
    <section className="overflow-hidden rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--mairie-text)]">
          <ListTodo className="size-4" strokeWidth={1.8} />
          Tâches
        </div>
        <span className="text-xs text-[var(--mairie-muted)]">
          {getCompletedTaskCount(values.tasks)}/{values.tasks.length}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <input
          value={draftTask.title}
          placeholder="Ajouter une tâche..."
          className={fieldClassName}
          disabled={!canManageTasks}
          onChange={(event) => setDraftTask((currentTask) => ({ ...currentTask, title: event.target.value }))}
        />

        <div className="grid gap-3 md:grid-cols-3">
          <ProjectSelect
            label="Statut"
            value={draftTask.status}
            options={editableProjectStatusOptions}
            showLabel
            disabled={!canManageTasks}
            onValueChange={(status) => setDraftTask((currentTask) => ({ ...currentTask, status }))}
          />
          <ProjectSelect
            label="Priorité"
            value={draftTask.priority}
            options={editableProjectPriorityOptions}
            showLabel
            disabled={!canManageTasks}
            onValueChange={(priority) => setDraftTask((currentTask) => ({ ...currentTask, priority }))}
          />
          <div>
            <label htmlFor="task-due-date" className="mb-1 block text-xs font-semibold text-[var(--mairie-muted)]">
              Échéance
            </label>
            <input
              id="task-due-date"
              type="date"
              value={draftTask.dueDate}
              className={fieldClassName}
              disabled={!canManageTasks}
              onChange={(event) => setDraftTask((currentTask) => ({ ...currentTask, dueDate: event.target.value }))}
            />
          </div>
        </div>

        <ProjectMultiSelect
          label="Assignés"
          value={draftTask.assigneeIds}
          options={memberOptions}
          placeholder="Choisir un ou plusieurs assignés"
          disabled={!canManageTasks}
          onValueChange={(assigneeIds) => setDraftTask((currentTask) => ({ ...currentTask, assigneeIds }))}
        />
        <ProjectMultiSelect
          label="Étiquettes"
          value={draftTask.tagIds}
          options={tagOptions}
          placeholder="Choisir une ou plusieurs étiquettes"
          disabled={!canManageTasks}
          onValueChange={(tagIds) => setDraftTask((currentTask) => ({ ...currentTask, tagIds }))}
        />

        <div className="flex justify-end gap-2">
          {editingTaskId && (
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-4 text-sm font-semibold text-[var(--mairie-text)] transition hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
              disabled={!canManageTasks}
              onClick={resetDraftTask}
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            disabled={!canManageTasks}
            className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--mairie-success-action-background)] px-4 text-sm font-semibold text-[var(--mairie-on-action)] shadow-sm transition hover:bg-[var(--mairie-success-action-hover-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35 disabled:cursor-not-allowed disabled:bg-[var(--mairie-border)]"
            onClick={handleSubmitTask}
          >
            {editingTaskId ? 'Mettre à jour la tâche' : 'Ajouter la tâche'}
          </button>
        </div>
        {!canManageTasks && (
          <div className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 py-2 text-xs text-[var(--mairie-muted)]">
            Vous pouvez consulter vos tâches, mettre à jour leur statut et ajouter un commentaire.
          </div>
        )}
      </div>

      <div className="grid gap-3 border-t border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] p-4 md:grid-cols-[minmax(0,1fr)_160px_160px_180px]">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--mairie-muted)]" />
          <input
            type="search"
            value={taskSearchValue}
            placeholder="Rechercher une tâche..."
            className="h-10 w-full rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] pl-10 pr-3 text-sm text-[var(--mairie-text)] outline-none transition placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20"
            onChange={(event) => setTaskSearchValue(event.target.value)}
          />
        </div>
        <ProjectSelect
          label="Filtrer les tâches par statut"
          value={taskStatusValue}
          options={statusOptionsForSelect}
          onValueChange={setTaskStatusValue}
        />
        <ProjectSelect
          label="Filtrer les tâches par priorité"
          value={taskPriorityValue}
          options={priorityOptionsForSelect}
          onValueChange={setTaskPriorityValue}
        />
        <ProjectDueDateFilter value={taskDueDateValue} onValueChange={setTaskDueDateValue} />
      </div>

      <div className="border-t border-[var(--mairie-border)]">
        {values.tasks.length === 0 ? (
          <div className="flex min-h-[100px] items-center justify-center px-4 py-6 text-sm text-[var(--mairie-muted)]">
            Aucune tâche pour ce projet.
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="flex min-h-[100px] items-center justify-center px-4 py-6 text-sm text-[var(--mairie-muted)]">
            Aucune tâche ne correspond aux filtres.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--mairie-border)]">
            {visibleTasks.map((task) => {
              const taskTags = task.tagIds.map((tagId) => getTag(tags, tagId)).filter(Boolean) as ProjectTag[];
              const taskComments = getTaskComments(task);
              const taskCanUpdate = canUpdateTask(task);
              const taskCanComment = canCommentTask(task);
              const commentDraft = commentDrafts[task.id] ?? '';

              return (
                <li key={task.id} className="flex items-start gap-4 px-4 py-3">
                  <button
                    type="button"
                    aria-label={`${task.status === 'done' ? 'Marquer à faire' : 'Marquer terminé'} : ${task.title}`}
                    disabled={!taskCanUpdate}
                    className="mt-1 text-[var(--mairie-muted)] transition hover:text-[var(--mairie-success-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleToggleTask(task)}
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 className="size-4 text-[var(--mairie-success-text)]" strokeWidth={2} />
                    ) : (
                      <Circle className="size-4" strokeWidth={2} />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold leading-5 text-[var(--mairie-text)]">{task.title}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <MemberAvatarStack members={members} ids={task.assigneeIds} max={2} />
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--mairie-muted)]">
                        <Calendar className="size-3.5" strokeWidth={1.8} />
                        {formatDate(task.dueDate)}
                      </span>
                      {taskTags.map((tag) => (
                        <ProjectTagPill key={tag.id} tag={tag} />
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                      <select
                        aria-label={`Statut de ${task.title}`}
                        value={task.status}
                        disabled={!taskCanUpdate}
                        className="h-8 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-2 text-xs text-[var(--mairie-text)] outline-none transition focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                        onChange={(event) => handleTaskStatusChange(task, event.target.value as ProjectStatus)}
                      >
                        {editableProjectStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        aria-label={`Commenter ${task.title}`}
                        value={commentDraft}
                        placeholder="Ajouter un commentaire..."
                        disabled={!taskCanComment}
                        className="h-8 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-3 text-xs text-[var(--mairie-text)] outline-none transition placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                        onChange={(event) =>
                          setCommentDrafts((currentDrafts) => ({
                            ...currentDrafts,
                            [task.id]: event.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        disabled={!taskCanComment || !commentDraft.trim()}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-3 text-xs font-semibold text-[var(--mairie-text)] transition hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => handleCommentTask(task)}
                      >
                        <MessageSquare className="size-3.5" strokeWidth={1.8} />
                        Commenter
                      </button>
                    </div>
                    {taskComments.length > 0 && (
                      <div className="mt-3 space-y-2 rounded-md bg-[var(--mairie-surface-raised)] p-3">
                        {taskComments.slice(-2).map((comment) => {
                          const author = comment.authorId ? getMember(members, comment.authorId) : undefined;

                          return (
                            <div key={comment.id} className="text-xs leading-5 text-[var(--mairie-muted)]">
                              <span className="font-semibold text-[var(--mairie-text)]">{author?.name ?? 'Agent'}</span>
                              <span className="mx-1 text-[var(--mairie-muted)]">·</span>
                              <span>{formatDate(comment.createdAt.slice(0, 10))}</span>
                              <div>{comment.message}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {canManageTasks && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] px-3 text-sm font-medium text-[var(--mairie-accent)] transition hover:bg-[var(--mairie-accent-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
                        onClick={() => handleEditTask(task)}
                      >
                        <Pencil className="size-4" strokeWidth={1.8} />
                        Modifier
                      </button>
                      <button
                        type="button"
                        aria-label={`Supprimer la tâche ${task.title}`}
                        className="inline-flex size-8 items-center justify-center rounded-md text-[var(--mairie-muted)] transition hover:bg-[var(--mairie-error-surface)] hover:text-[var(--mairie-error-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
                        onClick={() => handleRemoveTask(task)}
                      >
                        <X className="size-4" strokeWidth={1.8} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

const ProjectHistoryPanel = ({
  history,
  members,
}: {
  history: ProjectHistoryEntry[];
  members: ProjectMember[];
}) => (
  <section className="overflow-hidden rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)]">
    <div className="flex items-center gap-2 border-b border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-4 py-3 text-sm font-bold text-[var(--mairie-text)]">
      <History className="size-4" strokeWidth={1.8} />
      Historique des modifications
    </div>
    {history.length === 0 ? (
      <div className="px-4 py-5 text-sm text-[var(--mairie-muted)]">Aucune modification enregistrée.</div>
    ) : (
      <ul className="divide-y divide-[var(--mairie-border)]">
        {history.slice(0, 8).map((entry) => {
          const actor = entry.actorId ? getMember(members, entry.actorId) : undefined;

          return (
            <li key={entry.id} className="px-4 py-3 text-sm">
              <div className="font-semibold leading-5 text-[var(--mairie-text)]">{entry.label}</div>
              <div className="mt-1 text-xs leading-5 text-[var(--mairie-muted)]">
                {actor?.name ?? 'Système'} · {formatDate(entry.createdAt.slice(0, 10))}
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

const ProjectModal = ({
  isOpen,
  title,
  submitLabel,
  initialValues,
  members,
  tags,
  currentUserId,
  canEditProjectFields,
  canManageTasks,
  canAssignEmployees,
  canUpdateAssignedTasks,
  onCancel,
  onSubmit,
}: ProjectModalProps) => {
  const [values, setValues] = React.useState<ProjectFormValues>({
    ...defaultProjectFormValues,
    ...initialValues,
  });
  const titleId = React.useId();
  const titleInputId = React.useId();
  const objectivesInputId = React.useId();
  const descriptionInputId = React.useId();
  const memberOptions = members.map((member) => ({ value: member.id, label: member.name }));
  const ownerOptions = [{ value: '', label: 'Sélectionner un assigné' }, ...memberOptions];
  const tagOptions = tags.map((tag) => ({ value: tag.id, label: tag.label }));

  React.useEffect(() => {
    if (!isOpen) return;

    const ownerId = initialValues?.ownerId ?? '';
    setValues({
      ...defaultProjectFormValues,
      ownerId,
      assigneeIds: initialValues?.assigneeIds ?? [],
      ...initialValues,
    });
  }, [initialValues, isOpen, members]);

  if (!isOpen) return null;

  const canSubmit =
    values.title.trim() && values.objectives.trim() && values.description.trim() && values.ownerId && values.dueDate;
  const canSave = canSubmit && (canEditProjectFields || canManageTasks || canUpdateAssignedTasks);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSave) return;

    onSubmit({
      ...values,
      title: values.title.trim(),
      objectives: values.objectives.trim(),
      description: values.description.trim(),
      progress: clampProgress(values.progress),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mairie-overlay-background)]/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <form
        className="flex max-h-[calc(100vh-3rem)] w-full max-w-[1152px] flex-col overflow-hidden rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-background)] text-[var(--mairie-text)] shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex h-14 shrink-0 items-center justify-between bg-[var(--mairie-navigation-background)] px-5 text-[var(--mairie-on-action)]">
          <h2 id={titleId} className="text-base font-bold leading-6">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Fermer"
            className="inline-flex size-8 items-center justify-center rounded-md text-[var(--mairie-on-action)]/80 transition hover:bg-[var(--mairie-surface)]/10 hover:text-[var(--mairie-on-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-surface)]/35"
            onClick={onCancel}
          >
            <X className="size-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-4">
              <section className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-4">
                <label htmlFor={titleInputId} className="mb-2 block text-xs font-semibold text-[var(--mairie-muted)]">
                  Titre <span className="text-[var(--mairie-error-text)]">*</span>
                </label>
                <input
                  id={titleInputId}
                  value={values.title}
                  placeholder="Ajouter un titre..."
                  className={fieldClassName}
                  autoFocus
                  disabled={!canEditProjectFields}
                  onChange={(event) => setValues((currentValues) => ({ ...currentValues, title: event.target.value }))}
                />
              </section>

              <section className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-4">
                <label htmlFor={objectivesInputId} className="mb-2 block text-xs font-semibold text-[var(--mairie-muted)]">
                  Objectifs <span className="text-[var(--mairie-error-text)]">*</span>
                </label>
                <textarea
                  id={objectivesInputId}
                  value={values.objectives}
                  placeholder="Définir les objectifs attendus du projet..."
                  className="min-h-[96px] w-full resize-none rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 py-3 text-sm text-[var(--mairie-text)] outline-none transition placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={!canEditProjectFields}
                  onChange={(event) =>
                    setValues((currentValues) => ({ ...currentValues, objectives: event.target.value }))
                  }
                />
              </section>

              <section className="overflow-hidden rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)]">
                <div className="border-b border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-4 py-2">
                  <span className="inline-flex h-7 items-center rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-3 text-sm font-semibold text-[var(--mairie-text)]">
                    Écrire
                  </span>
                </div>
                <div className="p-4">
                  <label htmlFor={descriptionInputId} className="mb-2 block text-xs font-semibold text-[var(--mairie-muted)]">
                    Description <span className="text-[var(--mairie-error-text)]">*</span>
                  </label>
                  <textarea
                    id={descriptionInputId}
                    value={values.description}
                    placeholder="Ajouter une description, des critères d'acceptation ou des notes..."
                    className={textareaClassName}
                    disabled={!canEditProjectFields}
                    onChange={(event) =>
                      setValues((currentValues) => ({ ...currentValues, description: event.target.value }))
                    }
                  />
                </div>
              </section>

              <ProjectTaskEditor
                values={values}
                members={members}
                tags={tags}
                memberOptions={memberOptions}
                tagOptions={tagOptions}
                currentUserId={currentUserId}
                canManageTasks={canManageTasks}
                onValueChange={setValues}
              />

              <ProjectHistoryPanel history={values.history} members={members} />
            </div>

            <ProjectFieldPanel
              values={values}
              members={members}
              tags={tags}
              memberOptions={memberOptions}
              ownerOptions={ownerOptions}
              tagOptions={tagOptions}
              canEditProjectFields={canEditProjectFields}
              canAssignEmployees={canAssignEmployees}
              onValueChange={setValues}
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-5 py-3">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-4 text-sm font-bold text-[var(--mairie-text)] transition hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--mairie-success-action-background)] px-4 text-sm font-bold text-[var(--mairie-on-action)] shadow-sm transition hover:bg-[var(--mairie-success-action-hover-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35 disabled:cursor-not-allowed disabled:bg-[var(--mairie-border)]"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export const ProjectModule = ({
  title = 'Projets',
  subtitle = 'Gérez vos projets municipaux avec des vues Kanban, tableau et grille',
  projects,
  members = [],
  tags = [],
  viewMode,
  defaultViewMode = 'kanban',
  currentUserId,
  currentUserRole,
  teamMemberIds,
  onViewModeChange,
  onCreateProject,
  onUpdateProject,
  onProjectAction,
  onSettingsClick,
  className = '',
  ...props
}: ProjectModuleProps) => {
  const [internalViewMode, setInternalViewMode] = React.useState<ProjectViewMode>(defaultViewMode);
  const [searchValue, setSearchValue] = React.useState('');
  const [statusValue, setStatusValue] = React.useState<ProjectStatus | 'all'>('all');
  const [priorityValue, setPriorityValue] = React.useState<ProjectPriority | 'all'>('all');
  const [dueDateValue, setDueDateValue] = React.useState('');
  const [projectModalOpen, setProjectModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const resolvedProjects = projects ?? [];
  const resolvedViewMode = viewMode ?? internalViewMode;
  const currentMember = currentUserId ? getMember(members, currentUserId) : undefined;
  const resolvedTeamMemberIds =
    teamMemberIds ??
    (currentMember?.teamIds
      ? members
          .filter((member) => member.id !== currentUserId && member.teamIds?.some((teamId) => currentMember.teamIds?.includes(teamId)))
          .map((member) => member.id)
      : []);
  const canCreateProject = Boolean(currentUserRole && currentUserRole !== 'employee' && onCreateProject && members.length > 0);
  const canEditProjectFields = Boolean(currentUserRole && currentUserRole !== 'employee' && onUpdateProject);
  const canManageTasks = canEditProjectFields;
  const canAssignEmployees = canEditProjectFields;
  const canDeleteProject = Boolean(currentUserRole && currentUserRole !== 'employee' && onProjectAction);
  const canCloseProject = canEditProjectFields;
  const normalizedQuery = normalizeSearch(searchValue);
  const scopedProjects = resolvedProjects.filter((project) =>
    getProjectAccessScope(project, currentUserRole, currentUserId, resolvedTeamMemberIds)
  );
  const visibleProjects = scopedProjects.filter((project) => {
    const owner = getMember(members, project.ownerId);
    const projectTags = project.tagIds.map((tagId) => getTag(tags, tagId)?.label).filter(Boolean).join(' ');
    const searchable = normalizeSearch(
      `${project.title} ${project.objectives ?? ''} ${project.description} ${owner?.name ?? ''} ${projectTags}`
    );
    const matchesSearch = normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
    const matchesStatus = statusValue === 'all' || project.status === statusValue;
    const matchesPriority = priorityValue === 'all' || project.priority === priorityValue;
    const matchesDueDate = !dueDateValue || project.dueDate <= dueDateValue;

    return matchesSearch && matchesStatus && matchesPriority && matchesDueDate;
  });

  const handleViewModeChange = (nextViewMode: ProjectViewMode) => {
    if (viewMode === undefined) {
      setInternalViewMode(nextViewMode);
    }

    onViewModeChange?.(nextViewMode);
  };

  const handleNewProjectClick = () => {
    if (!canCreateProject) return;

    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    if (!canDeleteProject) return;
    onProjectAction?.(project, 'delete');
  };

  const handleCloseProject = (project: Project) => {
    if (!canCloseProject) return;

    const closedProject: Project = {
      ...project,
      status: 'done',
      progress: 100,
    };

    onUpdateProject?.(closedProject);
  };

  const handleCancelProjectModal = () => {
    setProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmitProjectModal = (values: ProjectFormValues) => {
    if (!editingProject) {
      onCreateProject?.(values);
      setProjectModalOpen(false);
      return;
    }

    const updatedProject = buildProjectFromValues(values, editingProject.sequence, editingProject.id);
    onUpdateProject?.(updatedProject);
    setEditingProject(null);
    setProjectModalOpen(false);
  };

  const handleSettingsClick = () => {
    onSettingsClick?.();
  };

  return (
    <section className={joinClasses('space-y-7 bg-[var(--mairie-background)] text-[var(--mairie-text)]', className)} {...props}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-tight text-[var(--mairie-text)]">{title}</h1>
          {subtitle && <p className="mt-2 text-base leading-6 text-[var(--mairie-text)]">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          {canCreateProject && (
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--mairie-action-background)] px-4 text-sm font-bold text-[var(--mairie-on-action)] shadow-[var(--mairie-shadow)] transition hover:bg-[var(--mairie-action-hover-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35"
              onClick={handleNewProjectClick}
            >
              <Plus className="size-4" strokeWidth={2} />
              Nouveau projet
            </button>
          )}
          {onSettingsClick && (
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-4 text-sm font-bold text-[var(--mairie-text)] transition hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
              onClick={handleSettingsClick}
            >
              <Settings className="size-4" strokeWidth={1.8} />
              Paramètres
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--mairie-border)]" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
          <ProjectSearchInput value={searchValue} onValueChange={setSearchValue} />
          <ProjectSelect
            label="Filtrer par statut"
            value={statusValue}
            options={statusOptionsForSelect}
            onValueChange={setStatusValue}
          />
          <ProjectSelect
            label="Filtrer par priorité"
            value={priorityValue}
            options={priorityOptionsForSelect}
            onValueChange={setPriorityValue}
          />
          <ProjectDueDateFilter value={dueDateValue} onValueChange={setDueDateValue} />
        </div>
        <div className="shrink-0">
          <ProjectViewSwitcher value={resolvedViewMode} onValueChange={handleViewModeChange} />
        </div>
      </div>

      <div className="border-t border-[var(--mairie-border)]" />

      {visibleProjects.length === 0 ? (
        <div className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-10 text-center text-sm text-[var(--mairie-muted)]">
          {scopedProjects.length === 0 ? 'Aucun projet disponible.' : 'Aucun projet ne correspond aux filtres.'}
        </div>
      ) : resolvedViewMode === 'kanban' ? (
        <KanbanView
          projects={visibleProjects}
          members={members}
          tags={tags}
          canEditProject={canEditProjectFields}
          canManageTasks={canManageTasks}
          canDeleteProject={canDeleteProject}
          canCloseProject={canCloseProject}
          onEdit={handleEditProject}
          onClose={handleCloseProject}
          onDelete={handleDeleteProject}
          onAction={onProjectAction}
        />
      ) : resolvedViewMode === 'grid' ? (
        <GridView
          projects={visibleProjects}
          members={members}
          tags={tags}
          canEditProject={canEditProjectFields}
          canManageTasks={canManageTasks}
          canDeleteProject={canDeleteProject}
          canCloseProject={canCloseProject}
          onEdit={handleEditProject}
          onClose={handleCloseProject}
          onDelete={handleDeleteProject}
          onAction={onProjectAction}
        />
      ) : (
        <TableView
          projects={visibleProjects}
          members={members}
          tags={tags}
          canEditProject={canEditProjectFields}
          canDeleteProject={canDeleteProject}
          canCloseProject={canCloseProject}
          onEdit={handleEditProject}
          onClose={handleCloseProject}
          onDelete={handleDeleteProject}
          onAction={onProjectAction}
        />
      )}

      <ProjectModal
        isOpen={projectModalOpen}
        title={editingProject ? 'Modifier le projet' : 'Nouveau projet'}
        submitLabel={editingProject ? 'Enregistrer' : 'Créer le projet'}
        initialValues={editingProject ? getProjectFormValues(editingProject) : undefined}
        members={members}
        tags={tags}
        currentUserId={currentUserId}
        canEditProjectFields={editingProject ? canEditProjectFields : canCreateProject}
        canManageTasks={editingProject ? canManageTasks : canCreateProject}
        canAssignEmployees={editingProject ? canAssignEmployees : canCreateProject}
        canUpdateAssignedTasks={currentUserRole === 'employee' && Boolean(onUpdateProject)}
        onCancel={handleCancelProjectModal}
        onSubmit={handleSubmitProjectModal}
      />
    </section>
  );
};
