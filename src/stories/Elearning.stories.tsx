import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { Award, BookOpen, CircleCheck, Filter, Play } from 'lucide-react';
import { fn } from 'storybook/test';

import { ElearningCatalog, type ElearningCourse } from '../components/ElearningCatalog';
import { ElearningCourseCard } from '../components/ElearningCourseCard';
import { ElearningCourseDetailsModal, type ElearningCourseDetails } from '../components/ElearningCourseDetailsModal';
import { ElearningCourseRating } from '../components/ElearningCourseRating';
import { ElearningFilterSelect } from '../components/ElearningFilterSelect';
import { ElearningStatCard } from '../components/ElearningStatCard';

const chapterContents = (
  baseId: string,
  videoTitle: string,
  videoDuration: string,
  supportTitle: string,
  extra?: { title: string; type: 'document' | 'link' | 'quiz'; description: string }
) => [
  {
    id: `${baseId}-video`,
    title: videoTitle,
    type: 'video' as const,
    duration: videoDuration,
    description: 'Séquence vidéo principale du chapitre.',
    href: '#',
  },
  {
    id: `${baseId}-support`,
    title: supportTitle,
    type: 'pdf' as const,
    description: 'Support de cours consultable au format PDF.',
    fileName: `${baseId}-support.pdf`,
    href: '#',
  },
  ...(extra
    ? [
        {
          id: `${baseId}-extra`,
          ...extra,
          href: '#',
        },
      ]
    : []),
];

const archivesRatingDistribution = {
  5: 55,
  4: 25,
  3: 7,
  2: 2,
  1: 0,
};

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
      contents: chapterContents(
        'security-rules',
        'Vidéo - règles générales de sécurité',
        '20min',
        'Fiche réflexe des règles générales',
        {
          title: 'Checklist de vérification du poste de travail',
          type: 'document',
          description: 'Liste synthétique à garder sous la main pendant la prise de poste.',
        }
      ),
    },
    {
      id: 'security-equipment',
      title: 'Équipements de protection individuelle et signalétique obligatoire',
      duration: '25min',
      completed: true,
      contents: chapterContents(
        'security-equipment',
        'Vidéo - choisir les bons équipements',
        '25min',
        'Guide des équipements obligatoires'
      ),
    },
    {
      id: 'security-fire',
      title: "Prévention incendie, évacuation et conduite à tenir en cas d'urgence",
      duration: '30min',
      completed: true,
      contents: chapterContents(
        'security-fire',
        'Vidéo - évacuation et prévention incendie',
        '30min',
        'Plan d’évacuation commenté',
        {
          title: 'Quiz de validation incendie',
          type: 'quiz',
          description: 'Quelques questions pour valider les réflexes essentiels.',
        }
      ),
    },
    {
      id: 'security-citizens',
      title: 'Accueil sécurisé du public et gestion des situations sensibles',
      duration: '22min',
      active: true,
      contents: chapterContents(
        'security-citizens',
        'Vidéo - accueil sécurisé du public',
        '22min',
        'Procédure d’accueil en zone municipale',
        {
          title: 'Lien vers le registre des incidents',
          type: 'link',
          description: 'Accès au registre de suivi utilisé par les équipes.',
        }
      ),
    },
    {
      id: 'security-assessment',
      title: 'Évaluation finale des consignes et validation de la formation obligatoire',
      duration: '18min',
      contents: chapterContents(
        'security-assessment',
        'Vidéo - préparation à l’évaluation finale',
        '18min',
        'Synthèse des consignes obligatoires',
        {
          title: 'Quiz final de sécurité',
          type: 'quiz',
          description: 'Validation de la formation obligatoire.',
        }
      ),
    },
  ],
};

const archivesCourseDetails: ElearningCourseDetails = {
  title: 'Gestion des archives numériques',
  description: 'Apprenez les bonnes pratiques pour organiser et conserver les documents numériques',
  instructor: 'Marc Dubois',
  duration: '1h 45min',
  rating: 4.5,
  ratingLabel: '(89 notes)',
  ratingDistribution: archivesRatingDistribution,
  progress: 100,
  completed: true,
  completionRating: {
    helperText: 'Formation terminée: donnez une note à cette session.',
    onSubmit: fn(),
  },
  onContentComplete: fn(),
  actionLabel: 'Revoir',
  chapters: [
    {
      id: 'archives-classification',
      title: 'Classer les documents numériques avec une nomenclature durable',
      duration: '18min',
      completed: true,
      contents: chapterContents(
        'archives-classification',
        'Vidéo - classer les archives numériques',
        '18min',
        'Modèle de nomenclature documentaire'
      ),
    },
    {
      id: 'archives-retention',
      title: 'Comprendre les durées de conservation et les obligations réglementaires',
      duration: '22min',
      completed: true,
      contents: chapterContents(
        'archives-retention',
        'Vidéo - durées de conservation',
        '22min',
        'Tableau des durées réglementaires',
        {
          title: 'Lien vers les règles d’archivage',
          type: 'link',
          description: 'Référence externe pour vérifier les obligations de conservation.',
        }
      ),
    },
    {
      id: 'archives-search',
      title: 'Retrouver rapidement une pièce administrative dans un fonds documentaire',
      duration: '20min',
      completed: true,
      contents: chapterContents(
        'archives-search',
        'Vidéo - rechercher une pièce administrative',
        '20min',
        'Méthode de recherche documentaire'
      ),
    },
    {
      id: 'archives-security',
      title: 'Sécuriser les accès et préparer une archive exploitable par les services',
      duration: '25min',
      completed: true,
      contents: chapterContents(
        'archives-security',
        'Vidéo - sécuriser une archive numérique',
        '25min',
        'Fiche des niveaux d’accès',
        {
          title: 'Exercice de contrôle des accès',
          type: 'quiz',
          description: 'Cas pratique sur les droits de consultation.',
        }
      ),
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
      contents: chapterContents(
        'communication-first-contact',
        'Vidéo - réussir le premier contact',
        '25min',
        'Fiche des phrases utiles',
        {
          title: 'Exercice de mise en situation',
          type: 'quiz',
          description: 'Scénario court pour vérifier la posture d’accueil.',
        }
      ),
    },
    {
      id: 'communication-listening',
      title: "Écoute active, reformulation et clarification d'une demande administrative",
      duration: '30min',
      contents: chapterContents(
        'communication-listening',
        'Vidéo - écoute active et reformulation',
        '30min',
        'Grille de reformulation'
      ),
    },
    {
      id: 'communication-difficult',
      title: 'Gérer une situation difficile avec calme, précision et posture professionnelle',
      duration: '35min',
      contents: chapterContents(
        'communication-difficult',
        'Vidéo - gérer une situation difficile',
        '35min',
        'Procédure de désescalade',
        {
          title: 'Lien vers le protocole interne',
          type: 'link',
          description: 'Accès au protocole de prise en charge des situations sensibles.',
        }
      ),
    },
    {
      id: 'communication-quality',
      title: "Garantir une qualité d'accueil constante entre les différents services",
      duration: '28min',
      contents: chapterContents(
        'communication-quality',
        'Vidéo - qualité d’accueil interservices',
        '28min',
        'Référentiel qualité d’accueil'
      ),
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
  onContentComplete: fn(),
  actionLabel: 'Continuer',
  chapters: [
    {
      id: 'intro',
      title: 'Introduction à la comptabilité publique et aux grands principes budgétaires',
      duration: '15min',
      completed: true,
      contents: chapterContents(
        'accounting-intro',
        'Vidéo - introduction à la comptabilité publique',
        '15min',
        'Support d’introduction aux principes budgétaires'
      ),
    },
    {
      id: 'equipment',
      title: 'Équipements des collectivités et suivi des dépenses pluriannuelles',
      duration: '20min',
      completed: true,
      contents: chapterContents(
        'accounting-equipment',
        'Vidéo - équipements et dépenses pluriannuelles',
        '20min',
        'Tableau de suivi budgétaire',
        {
          title: 'Exemple de document budgétaire annoté',
          type: 'document',
          description: 'Document d’exemple pour comprendre les lignes de dépense.',
        }
      ),
    },
    {
      id: 'first-steps',
      title: 'Gestes de première analyse pour contrôler une écriture comptable',
      duration: '25min',
      completed: true,
      contents: chapterContents(
        'accounting-first-steps',
        'Vidéo - contrôler une écriture comptable',
        '25min',
        'Fiche de contrôle des écritures'
      ),
    },
    {
      id: 'evaluation',
      title: "Évacuation d'urgence des anomalies et préparation d'un rapport clair",
      duration: '18min',
      completed: true,
      contents: chapterContents(
        'accounting-evaluation',
        'Vidéo - analyser une anomalie comptable',
        '18min',
        'Modèle de rapport d’anomalie',
        {
          title: 'Quiz de diagnostic budgétaire',
          type: 'quiz',
          description: 'Questions courtes pour vérifier le bon diagnostic.',
        }
      ),
    },
    {
      id: 'revision',
      title: 'Révision des cas pratiques et lecture complète des documents budgétaires',
      duration: '30min',
      active: true,
      contents: chapterContents(
        'accounting-revision',
        'Vidéo - révision des cas pratiques',
        '30min',
        'Dossier complet des cas pratiques',
        {
          title: 'Lien vers les annexes budgétaires',
          type: 'link',
          description: 'Documents complémentaires à consulter pendant la révision.',
        }
      ),
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
    ratingDistribution: archivesRatingDistribution,
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
    onCourseContentComplete: fn(),
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
          {...archivesCourseDetails}
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

export const CourseRating: StoryObj<typeof ElearningCourseRating> = {
  render: () => (
    <div className="min-h-screen bg-[#f4f2ef] p-8">
      <div className="max-w-sm">
        <ElearningCourseRating onSubmit={fn()} />
      </div>
    </div>
  ),
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
