import type {
  Project,
  ProjectMember,
  ProjectPriority,
  ProjectSelectOption,
  ProjectStatus,
  ProjectTag,
} from './types';

export const defaultProjectMembers: ProjectMember[] = [
  { id: 'marie-dubois', name: 'Marie Dubois', initials: 'MD' },
  { id: 'pierre-martin', name: 'Pierre Martin', initials: 'PM' },
  { id: 'sophie-leroy', name: 'Sophie Leroy', initials: 'SL' },
  { id: 'thomas-bernard', name: 'Thomas Bernard', initials: 'TB' },
  { id: 'alex-moreau', name: 'Alex Moreau', initials: 'AM' },
  { id: 'jean-dupont', name: 'Jean Dupont', initials: 'JD' },
];

export const defaultProjectTags: ProjectTag[] = [
  { id: 'infrastructure', label: 'Infrastructure', tone: 'blue' },
  { id: 'urgent', label: 'Urgent', tone: 'green' },
  { id: 'espaces-verts', label: 'Espaces verts', tone: 'blue' },
  { id: 'loisirs', label: 'Loisirs', tone: 'green' },
  { id: 'numerique', label: 'Numérique', tone: 'blue' },
  { id: 'archives', label: 'Archives', tone: 'green' },
  { id: 'energie', label: 'Énergie', tone: 'blue' },
  { id: 'environnement', label: 'Environnement', tone: 'green' },
  { id: 'communication', label: 'Communication', tone: 'green' },
  { id: 'voirie', label: 'Voirie', tone: 'blue' },
  { id: 'travaux', label: 'Travaux', tone: 'green' },
];

export const projectStatusOptions: ProjectSelectOption<ProjectStatus | 'all'>[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'todo', label: 'À faire' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'review', label: 'En révision' },
  { value: 'done', label: 'Terminé' },
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

const parkTasks = [
  'Cadrer le besoin avec les services',
  'Préparer le dossier administratif',
  'Valider le budget prévisionnel',
  'Consulter les prestataires',
  'Planifier les interventions',
  'Informer les habitants',
  'Contrôler les livrables',
  'Rédiger le compte rendu',
].map((title, index) => ({
  id: `park-task-${index + 1}`,
  title,
  status: index < 2 ? 'done' : 'todo',
  priority: 'medium',
  dueDate: '2025-03-20',
  assigneeIds: index % 2 === 0 ? ['pierre-martin'] : ['thomas-bernard'],
  tagIds: ['espaces-verts', 'loisirs'],
})) satisfies Project['tasks'];

export const defaultProjects: Project[] = [
  {
    id: 'library-renovation',
    sequence: 1,
    title: 'Rénovation de la bibliothèque municipale',
    description: "Modernisation de l'espace lecture et installation de nouveaux équipements numériques",
    status: 'in-progress',
    priority: 'high',
    ownerId: 'marie-dubois',
    assigneeIds: ['marie-dubois', 'pierre-martin', 'sophie-leroy'],
    tagIds: ['infrastructure', 'urgent'],
    dueDate: '2024-12-15',
    progress: 65,
    tasks: Array.from({ length: 12 }, (_, index) => ({
      id: `library-task-${index + 1}`,
      title: index < 8 ? `Lot bibliothèque terminé ${index + 1}` : `Lot bibliothèque à suivre ${index + 1}`,
      status: index < 8 ? 'done' : 'in-progress',
      priority: index < 3 ? 'high' : 'medium',
      dueDate: '2024-12-15',
      assigneeIds: ['marie-dubois'],
      tagIds: ['infrastructure'],
    })),
  },
  {
    id: 'central-park',
    sequence: 2,
    title: 'Aménagement du parc central',
    description: "Installation de nouveaux jeux pour enfants et création d'un parcours santé",
    status: 'todo',
    priority: 'medium',
    ownerId: 'pierre-martin',
    assigneeIds: ['pierre-martin', 'thomas-bernard'],
    tagIds: ['espaces-verts', 'loisirs'],
    dueDate: '2025-03-20',
    progress: 20,
    tasks: parkTasks,
  },
  {
    id: 'archive-digitization',
    sequence: 3,
    title: 'Digitalisation des archives',
    description: 'Numérisation des documents administratifs historiques',
    status: 'done',
    priority: 'low',
    ownerId: 'sophie-leroy',
    assigneeIds: ['sophie-leroy'],
    tagIds: ['numerique', 'archives'],
    dueDate: '2024-09-30',
    progress: 100,
    tasks: Array.from({ length: 5 }, (_, index) => ({
      id: `archive-task-${index + 1}`,
      title: `Lot archives ${index + 1}`,
      status: 'done',
      priority: 'low',
      dueDate: '2024-09-30',
      assigneeIds: ['sophie-leroy'],
      tagIds: ['numerique', 'archives'],
    })),
  },
  {
    id: 'led-lighting',
    sequence: 4,
    title: 'Installation système éclairage LED',
    description: "Remplacement de l'éclairage public par des LED économiques",
    status: 'review',
    priority: 'high',
    ownerId: 'thomas-bernard',
    assigneeIds: ['thomas-bernard', 'marie-dubois'],
    tagIds: ['energie', 'environnement'],
    dueDate: '2024-11-30',
    progress: 85,
    tasks: Array.from({ length: 15 }, (_, index) => ({
      id: `led-task-${index + 1}`,
      title: index < 13 ? `Secteur LED validé ${index + 1}` : `Secteur LED à vérifier ${index + 1}`,
      status: index < 13 ? 'done' : 'review',
      priority: index > 11 ? 'high' : 'medium',
      dueDate: '2024-11-30',
      assigneeIds: ['thomas-bernard'],
      tagIds: ['energie'],
    })),
  },
  {
    id: 'municipal-website',
    sequence: 5,
    title: 'Création site web municipal',
    description: "Développement d'un nouveau site web moderne et accessible",
    status: 'in-progress',
    priority: 'medium',
    ownerId: 'alex-moreau',
    assigneeIds: ['alex-moreau'],
    tagIds: ['numerique', 'communication'],
    dueDate: '2024-12-31',
    progress: 40,
    tasks: Array.from({ length: 10 }, (_, index) => ({
      id: `website-task-${index + 1}`,
      title: index < 4 ? `Sprint web terminé ${index + 1}` : `Sprint web à produire ${index + 1}`,
      status: index < 4 ? 'done' : 'in-progress',
      priority: 'medium',
      dueDate: '2024-12-31',
      assigneeIds: ['alex-moreau'],
      tagIds: ['numerique', 'communication'],
    })),
  },
  {
    id: 'city-center-roads',
    sequence: 6,
    title: 'Réfection des routes du centre-ville',
    description: 'Travaux de rénovation des principales artères du centre historique',
    status: 'todo',
    priority: 'high',
    ownerId: 'jean-dupont',
    assigneeIds: ['jean-dupont'],
    tagIds: ['voirie', 'travaux'],
    dueDate: '2025-05-15',
    progress: 5,
    tasks: Array.from({ length: 20 }, (_, index) => ({
      id: `roads-task-${index + 1}`,
      title: index === 0 ? 'Diagnostic voirie réalisé' : `Tronçon à traiter ${index + 1}`,
      status: index === 0 ? 'done' : 'todo',
      priority: 'high',
      dueDate: '2025-05-15',
      assigneeIds: ['jean-dupont'],
      tagIds: ['voirie', 'travaux'],
    })),
  },
];
