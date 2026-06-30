import type { LucideIcon } from 'lucide-react';

export type ProjectStatus = 'todo' | 'in-progress' | 'review' | 'done';

export type ProjectPriority = 'low' | 'medium' | 'high';

export type ProjectViewMode = 'kanban' | 'grid' | 'table';

export type ProjectAction = 'open' | 'edit' | 'delete';

export type ProjectTagTone = 'blue' | 'green' | 'red' | 'purple' | 'gray';

export interface ProjectMember {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
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
}

export interface Project {
  id: string;
  sequence: number;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerId: string;
  assigneeIds: string[];
  tagIds: string[];
  dueDate: string;
  progress: number;
  tasks: ProjectTask[];
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
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerId: string;
  assigneeIds: string[];
  tagIds: string[];
  dueDate: string;
  progress: number;
  tasks: ProjectTask[];
}
