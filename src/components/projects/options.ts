import type { ProjectPriority, ProjectSelectOption, ProjectStatus } from './types';

export const projectStatusOptions: ProjectSelectOption<ProjectStatus | 'all'>[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'todo', label: 'À faire' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'review', label: 'En révision' },
  { value: 'done', label: 'Terminé' },
  { value: 'suspended', label: 'Suspendu' },
];

export const projectPriorityOptions: ProjectSelectOption<ProjectPriority | 'all'>[] = [
  { value: 'all', label: 'Toutes les priorités' },
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' },
];

export const editableProjectStatusOptions: ProjectSelectOption<ProjectStatus>[] = projectStatusOptions.filter(
  (option): option is ProjectSelectOption<ProjectStatus> => option.value !== 'all'
);

export const editableProjectPriorityOptions: ProjectSelectOption<ProjectPriority>[] = projectPriorityOptions.filter(
  (option): option is ProjectSelectOption<ProjectPriority> => option.value !== 'all'
);
