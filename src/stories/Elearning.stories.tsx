import type { Meta, StoryObj } from '@storybook/nextjs';
import { Award, BookOpen, CircleCheck, Filter, Play } from 'lucide-react';
import { fn } from 'storybook/test';

import { ElearningCatalog, type ElearningCourse } from '../components/ElearningCatalog';
import { ElearningCourseCard } from '../components/ElearningCourseCard';
import { ElearningFilterSelect } from '../components/ElearningFilterSelect';
import { ElearningStatCard } from '../components/ElearningStatCard';

const courses: ElearningCourse[] = [
  {
    id: 'security',
    category: 'Sécurité',
    statusValue: 'in-progress',
    title: 'Sécurité au travail - Formation obligatoire',
    description: 'Formation sur les règles de sécurité à respecter dans les bâtiments municipaux',
    instructor: 'Dr. Catherine Moreau',
    rating: 4.8,
    duration: '2h 30min',
    chapters: 8,
    learners: 156,
    titleBadge: { label: 'Obligatoire', variant: 'mandatory' },
    levelBadge: { label: 'Débutant', variant: 'beginner' },
    statusBadge: { label: 'En cours', variant: 'inProgress' },
    progress: 72,
    deadline: '15/11/2024',
    actionLabel: 'Continuer',
  },
  {
    id: 'archives',
    category: 'Administration',
    statusValue: 'completed',
    title: 'Gestion des archives numériques',
    description: 'Apprenez les bonnes pratiques pour organiser et conserver les documents numériques',
    instructor: 'Marc Dubois',
    rating: 4.5,
    duration: '1h 45min',
    chapters: 6,
    learners: 89,
    levelBadge: { label: 'Intermédiaire', variant: 'intermediate' },
    statusBadge: { label: 'Terminé', variant: 'completed' },
    progress: 100,
    actionLabel: 'Revoir',
  },
  {
    id: 'communication',
    category: 'Communication',
    statusValue: 'not-started',
    title: 'Accueil du public et communication',
    description: 'Techniques de communication pour un accueil de qualité des citoyens',
    instructor: 'Sophie Laurent',
    rating: 4.7,
    duration: '3h 15min',
    chapters: 10,
    learners: 203,
    titleBadge: { label: 'Obligatoire', variant: 'mandatory' },
    levelBadge: { label: 'Débutant', variant: 'beginner' },
    statusBadge: { label: 'Obligatoire', variant: 'mandatory' },
    actionLabel: 'Commencer',
  },
  {
    id: 'accounting',
    category: 'Finances',
    statusValue: 'in-progress',
    title: 'Comptabilité publique - Niveau avancé',
    description: 'Perfectionnement en comptabilité publique et gestion budgétaire',
    instructor: 'Pierre Bertrand',
    rating: 4.6,
    duration: '4h 20min',
    chapters: 12,
    learners: 45,
    levelBadge: { label: 'Avancé', variant: 'advanced' },
    statusBadge: { label: 'En cours', variant: 'inProgress' },
    progress: 25,
    actionLabel: 'Continuer',
  },
];

const stats = [
  {
    label: 'Formations disponibles',
    value: 24,
    icon: BookOpen,
    iconColor: '#1b57ff',
  },
  {
    label: 'En cours',
    value: 2,
    icon: Play,
    iconColor: '#00a651',
  },
  {
    label: 'Terminées',
    value: 8,
    icon: CircleCheck,
    iconColor: '#8b2cff',
  },
  {
    label: 'Certifications',
    value: 3,
    icon: Award,
    iconColor: '#f4b000',
  },
];

const { id: _id, category: _category, statusValue: _statusValue, ...accountingCourseCard } = courses[3];

const meta = {
  title: 'Components/Elearning/Elearning Catalog',
  component: ElearningCatalog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ElearningCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Catalog: Story = {
  args: {
    courses,
    stats,
    certificationCount: 3,
    className: 'min-h-screen border-t-4 border-[#8ccfd0]',
    onCourseAction: fn(),
  },
};

export const CourseCard: StoryObj<typeof ElearningCourseCard> = {
  render: () => (
    <div className="w-[360px] bg-[#f4f2ef] p-6">
      <ElearningCourseCard {...accountingCourseCard} onAction={fn()} />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const FilterOpenStates: StoryObj = {
  render: () => (
    <div className="flex min-h-[220px] gap-4 bg-[#f4f2ef] p-8">
      <ElearningFilterSelect
        className="w-48"
        defaultOpen
        leadingIcon={Filter}
        defaultValue="all"
        options={[
          { label: 'Toutes les catégories', value: 'all' },
          { label: 'Sécurité', value: 'security' },
          { label: 'Administration', value: 'administration' },
          { label: 'Communication', value: 'communication' },
          { label: 'Finances', value: 'finances' },
        ]}
      />
      <ElearningFilterSelect
        className="w-48"
        defaultOpen
        defaultValue="all"
        options={[
          { label: 'Tous les statuts', value: 'all' },
          { label: 'Non commencé', value: 'not-started' },
          { label: 'En cours', value: 'in-progress' },
          { label: 'Terminé', value: 'completed' },
        ]}
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const StatCards: StoryObj = {
  render: () => (
    <div className="grid w-[1130px] grid-cols-4 gap-4 bg-[#f4f2ef] p-6">
      {stats.map((stat) => (
        <ElearningStatCard key={stat.label} {...stat} />
      ))}
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};
