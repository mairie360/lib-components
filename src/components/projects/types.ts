import type { LucideIcon } from 'lucide-react';

export type ProjectStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'suspended';

export type ProjectPriority = 'low' | 'medium' | 'high';

export type ProjectViewMode = 'kanban' | 'grid' | 'table';

export type ProjectAction = 'open' | 'edit' | 'close' | 'delete';

export type ProjectUserRole = 'employee' | 'responsable' | 'mayor';

export type ProjectTagTone = 'blue' | 'green' | 'red' | 'purple' | 'gray';

export interface ProjectMember {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  teamIds?: string[];
}

export interface ProjectTag {
  id: string;
  label: string;
  tone: ProjectTagTone;
}

export interface ProjectTask {
  id: string;
  title: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate: string;
  assigneeIds: string[];
  tagIds: string[];
  comments?: ProjectTaskComment[];
}

export interface ProjectTaskComment {
  id: string;
  authorId?: string;
  message: string;
  createdAt: string;
}

export interface ProjectHistoryEntry {
  id: string;
  actorId?: string;
  label: string;
  target?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  sequence: number;
  title: string;
  objectives?: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerId: string;
  assigneeIds: string[];
  tagIds: string[];
  dueDate: string;
  progress: number;
  tasks: ProjectTask[];
  history?: ProjectHistoryEntry[];
}

export interface ProjectSelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

export interface ProjectStatusMeta {
  label: string;
  icon: LucideIcon;
  columnClassName: string;
  badgeClassName: string;
  dotClassName: string;
}

export interface ProjectPriorityMeta {
  label: string;
  badgeClassName: string;
  dotClassName: string;
}

export interface ProjectFormValues {
  title: string;
  objectives: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerId: string;
  assigneeIds: string[];
  tagIds: string[];
  dueDate: string;
  progress: number;
  tasks: ProjectTask[];
  history: ProjectHistoryEntry[];
}
