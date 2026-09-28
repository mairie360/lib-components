import React from 'react';
import { Award, BookOpen, Filter, Pencil, Percent, Plus, Trash2, Users } from 'lucide-react';

import { ElearningAdminStats, type ElearningAdminStatsData } from './ElearningAdminStats';
import type { ElearningBadgeVariant } from './ElearningBadge';
import { ElearningCourseCard, type ElearningCourseCardProps } from './ElearningCourseCard';
import {
  createEmptyCourseChapter,
  ElearningCourseFormModal,
  type ElearningCourseFormValues,
  type ElearningCourseLevel,
  type ElearningCourseRequirement,
} from './ElearningCourseFormModal';
import {
  ElearningCourseDetailsModal,
  type ElearningCourseContentCompletePayload,
  getElearningRatingAverage,
  incrementElearningRatingDistribution,
  type ElearningCourseDetails,
  type ElearningCourseRatingDistribution,
  type ElearningCourseRatingSummary,
} from './ElearningCourseDetailsModal';
import { ElearningFilterSelect, type ElearningFilterOption } from './ElearningFilterSelect';
import { ElearningSearchInput } from './ElearningSearchInput';
import { ElearningStatCard, type ElearningStatCardProps } from './ElearningStatCard';
import { joinClasses } from './calendar/style';

export interface ElearningCourse extends ElearningCourseCardProps {
  id: string;
  category?: string;
  statusValue?: string;
  ratingDistribution?: ElearningCourseRatingDistribution;
  details?: ElearningCourseDetails;
}

export type ElearningUserRole = 'user' | 'administrator';

export interface ElearningCatalogProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  certificationCount?: number;
  courses: ElearningCourse[];
  stats?: ElearningStatCardProps[];
  adminStats?: ElearningAdminStatsData;
  categories?: ElearningFilterOption[];
  statuses?: ElearningFilterOption[];
  defaultSearch?: string;
  defaultCategory?: string;
  defaultStatus?: string;
  emptyLabel?: string;
  currentUserRole?: ElearningUserRole;
  initialCourseId?: string | null;
  onCourseClose?: () => void;
  onCourseAction?: (course: ElearningCourse) => void;
  onCreateCourse?: (course: ElearningCourse, values: ElearningCourseFormValues) => void;
  onUpdateCourse?: (course: ElearningCourse, values: ElearningCourseFormValues) => void;
  onDeleteCourse?: (course: ElearningCourse) => void;
  onCourseRatingSubmit?: (course: ElearningCourse, rating: number, summary: ElearningCourseRatingSummary) => void;
  onCourseContentComplete?: (course: ElearningCourse, payload: ElearningCourseContentCompletePayload) => void;
}

const defaultStatuses: ElearningFilterOption[] = [
  { label: 'Tous les statuts', value: 'all' },
  { label: 'Non commencé', value: 'not-started' },
  { label: 'En cours', value: 'in-progress' },
  { label: 'Terminé', value: 'completed' },
];

const statusMeta: Record<string, { label: string; variant: ElearningBadgeVariant }> = {
  'not-started': { label: 'Non commencé', variant: 'notStarted' },
  'in-progress': { label: 'En cours', variant: 'inProgress' },
  completed: { label: 'Terminé', variant: 'completed' },
};

const levelMeta: Record<Exclude<ElearningCourseLevel, 'none'>, { label: string; variant: ElearningBadgeVariant }> = {
  beginner: { label: 'Débutant', variant: 'beginner' },
  intermediate: { label: 'Intermédiaire', variant: 'intermediate' },
  advanced: { label: 'Avancé', variant: 'advanced' },
};

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const clampProgress = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const parseNumberValue = (value?: number | string) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const inferStatusValue = (course: ElearningCourse) => {
  if (course.statusValue) return course.statusValue;
  const statusLabel = normalize(course.statusBadge?.label ?? '');
  if (statusLabel.includes('termine')) return 'completed';
  if (statusLabel.includes('cours')) return 'in-progress';
  return 'not-started';
};

const getCourseProgress = (course: ElearningCourse) => {
  if (typeof course.progress === 'number') return clampProgress(course.progress);
  if (typeof course.details?.progress === 'number') return clampProgress(course.details.progress);
  return 0;
};

const hasCourseProgress = (course: ElearningCourse) =>
  typeof course.progress === 'number' || typeof course.details?.progress === 'number';

const getStatusBadge = (statusValue: string, fallback?: ElearningCourse['statusBadge']) => ({
  ...fallback,
  label: statusMeta[statusValue]?.label ?? fallback?.label ?? 'Non commencé',
  variant: statusMeta[statusValue]?.variant ?? fallback?.variant ?? 'notStarted',
});

const getRequirement = (course?: ElearningCourse): ElearningCourseRequirement => {
  if (course?.titleBadge?.variant === 'mandatory' || normalize(course?.titleBadge?.label ?? '').includes('obligatoire')) {
    return 'mandatory';
  }
  if (normalize(course?.titleBadge?.label ?? '').includes('recommande')) return 'recommended';
  return 'none';
};

const getLevel = (course?: ElearningCourse): ElearningCourseLevel => {
  const variant = course?.levelBadge?.variant;
  if (variant === 'beginner' || variant === 'intermediate' || variant === 'advanced') return variant;
  return 'none';
};

const getTitleBadge = (requirement: ElearningCourseRequirement): ElearningCourse['titleBadge'] => {
  if (requirement === 'mandatory') return { label: 'Obligatoire', variant: 'mandatory' };
  if (requirement === 'recommended') return { label: 'Recommandé', variant: 'default' };
  return undefined;
};

const getLevelBadge = (level: ElearningCourseLevel): ElearningCourse['levelBadge'] =>
  level === 'none' ? undefined : levelMeta[level];

const buildCategories = (courses: ElearningCourse[]) => {
  const uniqueCategories = Array.from(new Set(courses.map((course) => course.category).filter(Boolean)));
  return [
    { label: 'Toutes les catégories', value: 'all' },
    ...uniqueCategories.map((category) => ({ label: category as string, value: category as string })),
  ];
};

const getPercentage = (value: number, total: number) => `${total === 0 ? 0 : Math.round((value / total) * 100)}%`;

const buildDefaultStats = (courses: ElearningCourse[], certificationCount = 0): ElearningStatCardProps[] => {
  const totalCourses = courses.length;
  const participatingCourses = courses.filter((course) => inferStatusValue(course) !== 'not-started' || getCourseProgress(course) > 0).length;
  const coursesWithProgress = courses.filter(hasCourseProgress);
  const averageProgress = coursesWithProgress.length
    ? Math.round(coursesWithProgress.reduce((total, course) => total + getCourseProgress(course), 0) / coursesWithProgress.length)
    : 0;

  return [
    { label: 'Formations disponibles', value: totalCourses, icon: BookOpen, iconColor: '#1b57ff' },
    { label: 'Participation', value: getPercentage(participatingCourses, totalCourses), icon: Users, iconColor: '#00a651' },
    { label: 'Complétion', value: `${averageProgress}%`, icon: Percent, iconColor: '#8b2cff' },
    { label: 'Certifications', value: certificationCount, icon: Award, iconColor: '#f4b000' },
  ];
};

const buildAdminStats = (courses: ElearningCourse[]): ElearningAdminStatsData => {
  const ratings = courses.map((course) => Number(course.rating)).filter((rating) => Number.isFinite(rating));
  const coursesWithProgress = courses.filter(hasCourseProgress);
  return {
    totalCourses: courses.length,
    totalLearners: courses.reduce((total, course) => total + parseNumberValue(course.learners), 0),
    mandatoryCourses: courses.filter((course) => getRequirement(course) === 'mandatory').length,
    totalContents: courses.reduce(
      (total, course) =>
        total + (course.details?.chapters ?? []).reduce((chapterTotal, chapter) => chapterTotal + (chapter.contents?.length ?? 0), 0),
      0
    ),
    averageRating: ratings.length ? Math.round((ratings.reduce((total, rating) => total + rating, 0) / ratings.length) * 10) / 10 : 0,
    completionRate: coursesWithProgress.length
      ? Math.round(coursesWithProgress.reduce((total, course) => total + getCourseProgress(course), 0) / coursesWithProgress.length)
      : 0,
  };
};

const getCourseDetails = (course: ElearningCourse): ElearningCourseDetails => course.details ?? {
  title: course.title,
  description: course.description,
  instructor: course.instructor,
  duration: course.duration,
  rating: course.rating,
  progress: course.progress,
  chapters: [],
};

const getCourseFormValues = (course?: ElearningCourse): ElearningCourseFormValues => {
  const details = course ? getCourseDetails(course) : undefined;
  return {
    title: course?.title ?? '',
    subtitle: details?.subtitle ?? '',
    description: course?.description ?? '',
    category: course?.category ?? '',
    statusValue: course ? inferStatusValue(course) : 'not-started',
    instructor: course?.instructor ?? '',
    duration: course?.duration ?? '',
    deadline: course?.deadline ?? '',
    requirement: getRequirement(course),
    level: getLevel(course),
    chapters: details?.chapters.length
      ? details.chapters.map((chapter) => ({
          ...chapter,
          description: chapter.description ?? '',
          contents: (chapter.contents ?? []).map((content) => ({ ...content })),
        }))
      : [createEmptyCourseChapter()],
  };
};

const createCourseId = (title: string) => {
  const slug = normalize(title).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${slug || 'formation'}-${Date.now().toString(36)}`;
};

const buildCourseFromFormValues = (values: ElearningCourseFormValues, existingCourse?: ElearningCourse): ElearningCourse => {
  const chapters = values.chapters.map((chapter) => ({
    ...chapter,
    contents: chapter.contents.map((content) => ({
      ...content,
    })),
  }));
  const statusValue = values.statusValue;

  return {
    ...existingCourse,
    id: existingCourse?.id ?? createCourseId(values.title),
    title: values.title,
    description: values.description,
    category: values.category || undefined,
    statusValue,
    instructor: values.instructor || undefined,
    duration: values.duration || undefined,
    deadline: values.deadline || undefined,
    chapters: chapters.length,
    learners: existingCourse?.learners ?? 0,
    progress: existingCourse?.progress,
    titleBadge: getTitleBadge(values.requirement),
    levelBadge: getLevelBadge(values.level),
    statusBadge: getStatusBadge(statusValue, existingCourse?.statusBadge),
    details: {
      ...existingCourse?.details,
      title: values.title,
      subtitle: values.subtitle || undefined,
      description: values.description,
      instructor: values.instructor || undefined,
      duration: values.duration || undefined,
      progress: existingCourse?.details?.progress,
      completed: existingCourse?.details?.completed,
      chapters,
      completionRating: existingCourse?.details?.completionRating ?? { title: 'Noter cette formation' },
    },
  };
};

export const ElearningCatalog = ({
  title = 'Centre de formation',
  subtitle = 'Développez vos compétences professionnelles',
  certificationCount = 0,
  courses,
  stats,
  adminStats,
  categories,
  statuses = defaultStatuses,
  defaultSearch = '',
  defaultCategory = 'all',
  defaultStatus = 'all',
  emptyLabel = 'Aucune formation ne correspond aux filtres.',
  currentUserRole = 'user',
  initialCourseId = null,
  onCourseClose,
  onCourseAction,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  onCourseRatingSubmit,
  onCourseContentComplete,
  className = '',
  ...props
}: ElearningCatalogProps) => {
  const [search, setSearch] = React.useState(defaultSearch);
  const [category, setCategory] = React.useState(defaultCategory);
  const [status, setStatus] = React.useState(defaultStatus);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(initialCourseId);
  const [editingCourseId, setEditingCourseId] = React.useState<string | null>(null);
  const [courseFormOpen, setCourseFormOpen] = React.useState(false);
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const editingCourse = courses.find((course) => course.id === editingCourseId);

  const canManageCourses = currentUserRole === 'administrator';
  const categoryOptions = React.useMemo(() => categories ?? buildCategories(courses), [categories, courses]);
  const displayedStats = stats ?? buildDefaultStats(courses, certificationCount);
  const displayedAdminStats = adminStats ?? buildAdminStats(courses);
  const selectedCourseDetails = React.useMemo(() => (selectedCourse ? getCourseDetails(selectedCourse) : undefined), [selectedCourse]);
  const courseFormInitialValues = React.useMemo(() => getCourseFormValues(editingCourse ?? undefined), [editingCourse]);

  const filteredCourses = React.useMemo(() => {
    const normalizedSearch = normalize(search.trim());
    return courses.filter((course) => {
      const matchesSearch = !normalizedSearch || normalize(`${course.title} ${course.description} ${course.instructor ?? ''}`).includes(normalizedSearch);
      return matchesSearch && (category === 'all' || course.category === category) && (status === 'all' || inferStatusValue(course) === status);
    });
  }, [category, courses, search, status]);

  const closeCourseForm = () => {
    setCourseFormOpen(false);
    setEditingCourseId(null);
  };

  const handleSubmitCourseForm = (values: ElearningCourseFormValues) => {
    if (!editingCourse) {
      if (!onCreateCourse) return;
      const createdCourse = buildCourseFromFormValues(values);
      onCreateCourse(createdCourse, values);
      closeCourseForm();
      return;
    }

    if (!onUpdateCourse) return;
    const updatedCourse = buildCourseFromFormValues(values, editingCourse);
    onUpdateCourse(updatedCourse, values);
    closeCourseForm();
  };

  const handleDeleteCourse = (course: ElearningCourse) => {
    onDeleteCourse?.(course);
  };

  return (
    <section className={joinClasses('bg-[#f4f2ef] px-6 py-14 text-[#2f3747]', className)} {...props}>
      <div className="mx-auto max-w-[1130px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold leading-8">{title}</h2>
            <p className="text-base leading-6 text-[#5f6470]">{subtitle}</p>
          </div>
          {canManageCourses && onCreateCourse ? (
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1256a6] px-4 text-sm font-semibold text-white hover:bg-[#0f4b91]" onClick={() => { setEditingCourseId(null); setCourseFormOpen(true); }}>
              <Plus className="size-4" /> Nouvelle formation
            </button>
          ) : null}
        </div>

        {canManageCourses ? <ElearningAdminStats stats={displayedAdminStats} /> : null}

        <div className="mt-7 grid gap-4 md:grid-cols-[minmax(300px,1fr)_minmax(240px,0.8fr)_minmax(220px,0.7fr)] xl:grid-cols-[320px_260px_240px]">
          <ElearningSearchInput value={search} onValueChange={setSearch} />
          <ElearningFilterSelect value={category} onValueChange={setCategory} options={categoryOptions} leadingIcon={Filter} placeholder="Toutes les catégories" />
          <ElearningFilterSelect value={status} onValueChange={setStatus} options={statuses} placeholder="Tous les statuts" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {displayedStats.map((stat) => <ElearningStatCard key={stat.label} {...stat} />)}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => {
            const { id, category: _category, statusValue: _statusValue, details, onAction, ratingDistribution, ...cardProps } = course;
            return (
              <div key={id} className="relative h-full">
                {canManageCourses ? (
                  <div className="absolute right-3 top-3 z-10 flex gap-2">
                    {onUpdateCourse ? <button type="button" aria-label={`Modifier ${course.title}`} className="inline-flex size-8 items-center justify-center rounded-md bg-white/95 text-[#1256a6] shadow-sm hover:bg-[#e9f1fb]" onClick={() => { setEditingCourseId(course.id); setCourseFormOpen(true); }}>
                      <Pencil className="size-4" />
                    </button> : null}
                    {onDeleteCourse ? <button type="button" aria-label={`Supprimer ${course.title}`} className="inline-flex size-8 items-center justify-center rounded-md bg-white/95 text-[#c5323a] shadow-sm hover:bg-[#fff1f2]" onClick={() => handleDeleteCourse(course)}>
                      <Trash2 className="size-4" />
                    </button> : null}
                  </div>
                ) : null}
                <ElearningCourseCard
                  {...cardProps}
                  rating={getElearningRatingAverage(details?.ratingDistribution ?? ratingDistribution) ?? cardProps.rating}
                  onAction={() => { onAction?.(); setSelectedCourseId(course.id); onCourseAction?.(course); }}
                />
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="mt-6 rounded-lg border border-[#d8d2ca] bg-white p-8 text-center text-sm text-[#5f6470]">{emptyLabel}</div>
        ) : null}
      </div>

      {selectedCourse && selectedCourseDetails ? (
        <ElearningCourseDetailsModal
          {...selectedCourseDetails}
          rating={getElearningRatingAverage(selectedCourseDetails.ratingDistribution ?? selectedCourse.ratingDistribution) ?? selectedCourseDetails.rating}
          ratingDistribution={selectedCourseDetails.ratingDistribution ?? selectedCourse.ratingDistribution}
          optimisticUpdates={false}
          completionRating={onCourseRatingSubmit || selectedCourseDetails.completionRating?.onSubmit ? {
            ...selectedCourseDetails.completionRating,
            onSubmit: (rating) => {
              const summary = incrementElearningRatingDistribution(selectedCourseDetails.ratingDistribution ?? selectedCourse.ratingDistribution, rating);
              selectedCourseDetails.completionRating?.onSubmit?.(rating);
              onCourseRatingSubmit?.(selectedCourse, rating, summary);
            },
          } : undefined}
          onContentComplete={onCourseContentComplete || selectedCourseDetails.onContentComplete ? (payload) => {
            selectedCourseDetails.onContentComplete?.(payload);
            onCourseContentComplete?.(selectedCourse, payload);
          } : undefined}
          open
          onClose={() => {
            setSelectedCourseId(null);
            onCourseClose?.();
          }}
        />
      ) : null}

      <ElearningCourseFormModal
        isOpen={courseFormOpen}
        title={editingCourse ? 'Modifier la formation' : 'Nouvelle formation'}
        submitLabel={editingCourse ? 'Enregistrer' : 'Créer'}
        initialValues={courseFormInitialValues}
        statusOptions={statuses}
        onCancel={closeCourseForm}
        onSubmit={handleSubmitCourseForm}
      />
    </section>
  );
};
