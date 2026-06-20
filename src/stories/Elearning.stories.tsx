import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { Award, BookOpen, CircleCheck, Filter, Play } from 'lucide-react';
import { fn } from 'storybook/test';

import { ElearningCatalog, type ElearningCourse } from '../components/ElearningCatalog';
import { ElearningCourseCard } from '../components/ElearningCourseCard';
import { ElearningCourseDetailsModal, type ElearningCourseDetails } from '../components/ElearningCourseDetailsModal';
import { ElearningFilterSelect } from '../components/ElearningFilterSelect';
import { ElearningStatCard } from '../components/ElearningStatCard';

const securityCourseDetails: ElearningCourseDetails = {
  title: 'Sécurité au travail - Formation obligatoire',
  description: 'Formation sur les règles de sécurité à respecter dans les bâtiments municipaux',
  instructor: 'Dr. Catherine Moreau',
  duration: '2h 30min',
  rating: 4.8,
  ratingLabel: '(156 apprenants)',
  progress: 72,
  actionLabel: 'Continuer',
  chapters: [
    {
      id: 'security-rules',
      title: 'Règles générales de sécurité dans les bâtiments municipaux',
      duration: '20min',
      completed: true,
    },
    {
      id: 'security-equipment',
      title: 'Équipements de protection individuelle et signalétique obligatoire',
      duration: '25min',
      completed: true,
    },
    {
      id: 'security-fire',
      title: "Prévention incendie, évacuation et conduite à tenir en cas d'urgence",
      duration: '30min',
      completed: true,
    },
    {
      id: 'security-citizens',
      title: 'Accueil sécurisé du public et gestion des situations sensibles',
      duration: '22min',
      active: true,
    },
    {
      id: 'security-assessment',
      title: 'Évaluation finale des consignes et validation de la formation obligatoire',
      duration: '18min',
    },
  ],
};

const archivesCourseDetails: ElearningCourseDetails = {
  title: 'Gestion des archives numériques',
  description: 'Apprenez les bonnes pratiques pour organiser et conserver les documents numériques',
  instructor: 'Marc Dubois',
  duration: '1h 45min',
  rating: 4.5,
  ratingLabel: '(89 apprenants)',
  progress: 100,
  actionLabel: 'Revoir',
  chapters: [
    {
      id: 'archives-classification',
      title: 'Classer les documents numériques avec une nomenclature durable',
      duration: '18min',
      completed: true,
    },
    {
      id: 'archives-retention',
      title: 'Comprendre les durées de conservation et les obligations réglementaires',
      duration: '22min',
      completed: true,
    },
    {
      id: 'archives-search',
      title: 'Retrouver rapidement une pièce administrative dans un fonds documentaire',
      duration: '20min',
      completed: true,
    },
    {
      id: 'archives-security',
      title: 'Sécuriser les accès et préparer une archive exploitable par les services',
      duration: '25min',
      completed: true,
    },
  ],
};

const communicationCourseDetails: ElearningCourseDetails = {
  title: 'Accueil du public et communication',
  description: 'Techniques de communication pour un accueil de qualité des citoyens',
  instructor: 'Sophie Laurent',
  duration: '3h 15min',
  rating: 4.7,
  ratingLabel: '(203 apprenants)',
  progress: 0,
  actionLabel: 'Commencer',
  chapters: [
    {
      id: 'communication-first-contact',
      title: 'Réussir le premier contact avec un citoyen au guichet ou au téléphone',
      duration: '25min',
      active: true,
    },
    {
      id: 'communication-listening',
      title: "Écoute active, reformulation et clarification d'une demande administrative",
      duration: '30min',
    },
    {
      id: 'communication-difficult',
      title: 'Gérer une situation difficile avec calme, précision et posture professionnelle',
      duration: '35min',
    },
    {
      id: 'communication-quality',
      title: "Garantir une qualité d'accueil constante entre les différents services",
      duration: '28min',
    },
  ],
};

const accountingCourseDetails: ElearningCourseDetails = {
  title: 'Comptabilité publique - Niveau avancé',
  description: 'Perfectionnement en comptabilité publique et gestion budgétaire',
  instructor: 'Pierre Bertrand',
  duration: '4h 20min',
  rating: 4.6,
  ratingLabel: '(45 étudiants)',
  progress: 25,
  actionLabel: 'Continuer',
  chapters: [
    {
      id: 'intro',
      title: 'Introduction à la comptabilité publique et aux grands principes budgétaires',
      duration: '15min',
      completed: true,
    },
    {
      id: 'equipment',
      title: 'Équipements des collectivités et suivi des dépenses pluriannuelles',
      duration: '20min',
      completed: true,
    },
    {
      id: 'first-steps',
      title: 'Gestes de première analyse pour contrôler une écriture comptable',
      duration: '25min',
      completed: true,
    },
    {
      id: 'evaluation',
      title: "Évacuation d'urgence des anomalies et préparation d'un rapport clair",
      duration: '18min',
      completed: true,
    },
    {
      id: 'revision',
      title: 'Révision des cas pratiques et lecture complète des documents budgétaires',
      duration: '30min',
      active: true,
    },
  ],
};

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
    details: securityCourseDetails,
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
    details: archivesCourseDetails,
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
    details: communicationCourseDetails,
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
    details: accountingCourseDetails,
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

export const CourseDetailsModal: StoryObj<typeof ElearningCourseDetailsModal> = {
  render: () => {
    const [open, setOpen] = React.useState(true);

    return (
      <div className="min-h-screen bg-[#f4f2ef] p-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md bg-[#1256a6] px-4 py-2 text-sm font-semibold text-white"
        >
          Ouvrir le détail du cours
        </button>
        <ElearningCourseDetailsModal
          {...accountingCourseDetails}
          open={open}
          onClose={() => setOpen(false)}
          onAction={fn()}
        />
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const CourseCard: StoryObj<typeof ElearningCourseCard> = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="min-h-screen bg-[#f4f2ef] p-6">
        <div className="w-[360px]">
          <ElearningCourseCard {...accountingCourseCard} onAction={() => setOpen(true)} />
        </div>
        <ElearningCourseDetailsModal
          {...accountingCourseDetails}
          open={open}
          onClose={() => setOpen(false)}
          onAction={fn()}
        />
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
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
