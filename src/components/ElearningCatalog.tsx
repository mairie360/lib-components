import React from 'react';
import { Award, BookOpen, Filter, Pencil, Percent, Plus, Trash2, Users, X } from 'lucide-react';

import { joinClasses } from './calendar/style';
import type { ElearningBadgeVariant } from './ElearningBadge';
import { ElearningCourseCard, type ElearningCourseCardProps } from './ElearningCourseCard';
import {
  ElearningCourseDetailsModal,
  type ElearningCourseContentCompletePayload,
  getElearningRatingAverage,
  incrementElearningRatingDistribution,
  type ElearningCourseDetails,
  type ElearningCourseProgressSummary,
  type ElearningCourseRatingDistribution,
  type ElearningCourseRatingSummary,
} from './ElearningCourseDetailsModal';
import { ElearningFilterSelect, type ElearningFilterOption } from './ElearningFilterSelect';
import { ElearningSearchInput } from './ElearningSearchInput';
import { ElearningStatCard, type ElearningStatCardProps } from './ElearningStatCard';

export interface ElearningCourse extends ElearningCourseCardProps {
  id: string;
  category?: string;
  statusValue?: string;
  ratingDistribution?: ElearningCourseRatingDistribution;
  details?: ElearningCourseDetails;
}

export type ElearningUserRole = 'user' | 'administrator';

export interface ElearningCourseFormValues {
  title: string;
  description: string;
  category: string;
  statusValue: string;
  instructor: string;
  duration: string;
  chapters: number;
  learners: number;
  progress: number;
}

export interface ElearningCatalogProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  certificationCount?: number;
  courses: ElearningCourse[];
  stats?: ElearningStatCardProps[];
  categories?: ElearningFilterOption[];
  statuses?: ElearningFilterOption[];
  defaultSearch?: string;
  defaultCategory?: string;
  defaultStatus?: string;
  emptyLabel?: string;
  currentUserRole?: ElearningUserRole;
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

const fieldClassName =
  'h-9 w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-sm text-[#172033] shadow-sm outline-none transition placeholder:text-[#64748b] focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20';

const textareaClassName =
  'min-h-24 w-full resize-none rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2 text-sm text-[#172033] shadow-sm outline-none transition placeholder:text-[#64748b] focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20';

const labelClassName = 'mb-1 block text-sm font-semibold text-[#334155]';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const inferStatusValue = (course: ElearningCourse) => {
  if (course.statusValue) return course.statusValue;

  const statusLabel = normalize(course.statusBadge?.label ?? '');

  if (statusLabel.includes('termine')) return 'completed';
  if (statusLabel.includes('cours')) return 'in-progress';
  if (statusLabel.includes('non')) return 'not-started';

  return 'all';
};

const clampProgress = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const parseNumberValue = (value?: number | string) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const getCourseProgress = (course: ElearningCourse) => {
  if (typeof course.progress === 'number') return clampProgress(course.progress);

  const statusValue = inferStatusValue(course);
  if (statusValue === 'completed') return 100;
  if (statusValue === 'in-progress') return 50;

  return 0;
};

const getRuntimeStatusValue = (course: ElearningCourse, progress: number) => {
  if (progress >= 100) return 'completed';
  if (progress > 0) return 'in-progress';

  const inferredStatus = inferStatusValue(course);
  return inferredStatus === 'all' ? 'not-started' : inferredStatus;
};

const getStatusBadge = (statusValue: string, fallback?: ElearningCourse['statusBadge']) => ({
  ...fallback,
  label: statusMeta[statusValue]?.label ?? fallback?.label ?? 'Non commencé',
  variant: statusMeta[statusValue]?.variant ?? fallback?.variant ?? 'default',
});

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
  const participatingCourses = courses.filter((course) => getCourseProgress(course) > 0).length;
  const averageProgress =
    totalCourses === 0
      ? 0
      : Math.round(courses.reduce((total, course) => total + getCourseProgress(course), 0) / totalCourses);

  return [
    {
      label: 'Formations disponibles',
      value: totalCourses,
      icon: BookOpen,
      iconColor: '#1b57ff',
    },
    {
      label: 'Participation',
      value: getPercentage(participatingCourses, totalCourses),
      icon: Users,
      iconColor: '#00a651',
    },
    {
      label: 'Complétion',
      value: `${averageProgress}%`,
      icon: Percent,
      iconColor: '#8b2cff',
    },
    {
      label: 'Certifications',
      value: certificationCount,
      icon: Award,
      iconColor: '#f4b000',
    },
  ];
};

const parseChapterCount = (chapters?: number | string) => {
  if (typeof chapters === 'number') return chapters;
  if (typeof chapters === 'string') {
    const parsed = Number.parseInt(chapters, 10);
    return Number.isNaN(parsed) ? 1 : parsed;
  }

  return 1;
};

const buildFallbackDetails = (course: ElearningCourse): ElearningCourseDetails => {
  const chapterCount = Math.max(1, parseChapterCount(course.chapters));
  const completed = inferStatusValue(course) === 'completed' || course.progress === 100;

  return {
    title: course.title,
    description: course.description,
    instructor: course.instructor,
    duration: course.duration,
    rating: course.rating,
    ratingLabel: course.learners !== undefined ? `(${course.learners} apprenants)` : undefined,
    ratingDistribution: course.ratingDistribution,
    progress: course.progress,
    completed,
    actionLabel: course.actionLabel,
    onAction: course.onAction,
    chapters: Array.from({ length: chapterCount }, (_, index) => {
      const chapterId = `${course.id}-chapter-${index + 1}`;

      return {
        id: chapterId,
        title: `Chapitre ${index + 1}`,
        duration: 'Durée estimée',
        completed:
          completed || (typeof course.progress === 'number' && ((index + 1) / chapterCount) * 100 <= course.progress),
        active:
          !completed &&
          typeof course.progress === 'number' &&
          ((index + 1) / chapterCount) * 100 > course.progress &&
          (index / chapterCount) * 100 <= course.progress,
        contents: [
          {
            id: `${chapterId}-video`,
            title: `Vidéo du chapitre ${index + 1}`,
            type: 'video' as const,
            description: 'Séquence principale à suivre pour ce chapitre.',
            duration: 'Durée estimée',
          },
          {
            id: `${chapterId}-support`,
            title: `Support du chapitre ${index + 1}`,
            type: 'pdf' as const,
            description: 'Document de référence associé au chapitre.',
            fileName: `support-chapitre-${index + 1}.pdf`,
          },
        ],
      };
    }),
  };
};

const getCourseDetails = (course: ElearningCourse) => course.details ?? buildFallbackDetails(course);

const getCourseFormValues = (course?: ElearningCourse): ElearningCourseFormValues => ({
  title: course?.title ?? '',
  description: course?.description ?? '',
  category: course?.category ?? '',
  statusValue: course ? inferStatusValue(course) : 'not-started',
  instructor: course?.instructor ?? '',
  duration: course?.duration ?? '',
  chapters: Math.max(1, parseChapterCount(course?.chapters)),
  learners: parseNumberValue(course?.learners),
  progress: course ? getCourseProgress(course) : 0,
});

const buildCourseFromFormValues = (values: ElearningCourseFormValues, existingCourse?: ElearningCourse): ElearningCourse => {
  const progress = values.statusValue === 'completed' ? 100 : clampProgress(values.progress);
  const statusValue = progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : values.statusValue;
  const nextCourse: ElearningCourse = {
    ...existingCourse,
    id: existingCourse?.id ?? `course-${Date.now()}-${Math.round(Math.random() * 100000)}`,
    title: values.title,
    description: values.description,
    category: values.category || undefined,
    statusValue,
    instructor: values.instructor || undefined,
    duration: values.duration || undefined,
    chapters: values.chapters,
    learners: values.learners,
    progress,
    statusBadge: getStatusBadge(statusValue, existingCourse?.statusBadge),
  };

  if (existingCourse?.details) {
    nextCourse.details = {
      ...existingCourse.details,
      title: values.title,
      description: values.description,
      instructor: values.instructor || undefined,
      duration: values.duration || undefined,
      progress,
    };
  }

  return nextCourse;
};

interface ElearningCourseFormModalProps {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  initialValues?: ElearningCourseFormValues;
  statusOptions: ElearningFilterOption[];
  onCancel: () => void;
  onSubmit: (values: ElearningCourseFormValues) => void;
}

const ElearningCourseFormModal = ({
  isOpen,
  title,
  submitLabel,
  initialValues,
  statusOptions,
  onCancel,
  onSubmit,
}: ElearningCourseFormModalProps) => {
  const [values, setValues] = React.useState(() => initialValues ?? getCourseFormValues());
  const titleId = React.useId();

  React.useEffect(() => {
    if (isOpen) {
      setValues(initialValues ?? getCourseFormValues());
    }
  }, [initialValues, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const updateValue = <Key extends keyof ElearningCourseFormValues>(
    key: Key,
    value: ElearningCourseFormValues[Key]
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category.trim(),
      instructor: values.instructor.trim(),
      duration: values.duration.trim(),
      chapters: Math.max(1, Math.round(values.chapters || 1)),
      learners: Math.max(0, Math.round(values.learners || 0)),
      progress: clampProgress(values.progress),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <form
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-lg bg-[#f8f7f5] text-[#2f3747] shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex min-h-14 items-center justify-between gap-4 bg-[#2f3747] px-5 py-3 text-white">
          <h2 id={titleId} className="min-w-0 truncate text-base font-semibold leading-6">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Fermer"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-white/75 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/35"
            onClick={onCancel}
          >
            <X className="size-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label htmlFor="elearning-course-title" className={labelClassName}>
              Titre
            </label>
            <input
              id="elearning-course-title"
              type="text"
              required
              value={values.title}
              placeholder="Titre de la formation"
              className={fieldClassName}
              onChange={(event) => updateValue('title', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="elearning-course-description" className={labelClassName}>
              Description
            </label>
            <textarea
              id="elearning-course-description"
              required
              value={values.description}
              placeholder="Objectif et contenu de la formation"
              className={textareaClassName}
              onChange={(event) => updateValue('description', event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="elearning-course-category" className={labelClassName}>
                Catégorie
              </label>
              <input
                id="elearning-course-category"
                type="text"
                value={values.category}
                placeholder="Sécurité, RH, Administration..."
                className={fieldClassName}
                onChange={(event) => updateValue('category', event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="elearning-course-status" className={labelClassName}>
                Statut
              </label>
              <select
                id="elearning-course-status"
                value={values.statusValue}
                className={fieldClassName}
                onChange={(event) => updateValue('statusValue', event.target.value)}
              >
                {statusOptions
                  .filter((statusOption) => statusOption.value !== 'all')
                  .map((statusOption) => (
                    <option key={statusOption.value} value={statusOption.value}>
                      {statusOption.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="elearning-course-instructor" className={labelClassName}>
                Instructeur
              </label>
              <input
                id="elearning-course-instructor"
                type="text"
                value={values.instructor}
                placeholder="Nom du formateur"
                className={fieldClassName}
                onChange={(event) => updateValue('instructor', event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="elearning-course-duration" className={labelClassName}>
                Durée
              </label>
              <input
                id="elearning-course-duration"
                type="text"
                value={values.duration}
                placeholder="2h 30min"
                className={fieldClassName}
                onChange={(event) => updateValue('duration', event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="elearning-course-chapters" className={labelClassName}>
                Chapitres
              </label>
              <input
                id="elearning-course-chapters"
                type="number"
                min={1}
                value={values.chapters}
                className={fieldClassName}
                onChange={(event) => updateValue('chapters', Number(event.target.value) || 1)}
              />
            </div>

            <div>
              <label htmlFor="elearning-course-learners" className={labelClassName}>
                Apprenants
              </label>
              <input
                id="elearning-course-learners"
                type="number"
                min={0}
                value={values.learners}
                className={fieldClassName}
                onChange={(event) => updateValue('learners', Number(event.target.value) || 0)}
              />
            </div>

            <div>
              <label htmlFor="elearning-course-progress" className={labelClassName}>
                Progression
              </label>
              <input
                id="elearning-course-progress"
                type="number"
                min={0}
                max={100}
                value={values.progress}
                className={fieldClassName}
                onChange={(event) => updateValue('progress', Number(event.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 bg-[#f8f7f5] px-6 py-4">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-white px-4 text-sm font-semibold text-[#2f3747] transition hover:bg-[#f4f2ef] focus:outline-none focus:ring-2 focus:ring-[#1256a6]/25"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#1256a6] px-4 text-sm font-semibold text-white transition hover:bg-[#0f4b91] focus:outline-none focus:ring-2 focus:ring-[#1256a6]/30"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export const ElearningCatalog = ({
  title = 'Centre de formation',
  subtitle = 'Développez vos compétences professionnelles',
  certificationCount = 0,
  courses,
  stats,
  categories,
  statuses = defaultStatuses,
  defaultSearch = '',
  defaultCategory = 'all',
  defaultStatus = 'all',
  emptyLabel = 'Aucune formation ne correspond aux filtres.',
  currentUserRole = 'user',
  onCourseAction,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  onCourseRatingSubmit,
  onCourseContentComplete,
  className = '',
  ...props
}: ElearningCatalogProps) => {
  const [managedCourses, setManagedCourses] = React.useState(courses);
  const [search, setSearch] = React.useState(defaultSearch);
  const [category, setCategory] = React.useState(defaultCategory);
  const [status, setStatus] = React.useState(defaultStatus);
  const [selectedCourse, setSelectedCourse] = React.useState<ElearningCourse | null>(null);
  const [editingCourse, setEditingCourse] = React.useState<ElearningCourse | null>(null);
  const [courseFormOpen, setCourseFormOpen] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [submittedRatingDistributions, setSubmittedRatingDistributions] = React.useState<
    Record<string, ElearningCourseRatingDistribution>
  >({});
  const [contentProgressByCourse, setContentProgressByCourse] = React.useState<
    Record<string, ElearningCourseProgressSummary>
  >({});

  React.useEffect(() => {
    setManagedCourses(courses);
  }, [courses]);

  const coursesWithRuntimeState = React.useMemo(
    () =>
      managedCourses.map((course) => {
        const progress = contentProgressByCourse[course.id]?.progress ?? getCourseProgress(course);
        const statusValue = getRuntimeStatusValue(course, progress);
        const displayedRatingDistribution =
          submittedRatingDistributions[course.id] ?? course.details?.ratingDistribution ?? course.ratingDistribution;
        const displayedRating = getElearningRatingAverage(displayedRatingDistribution) ?? course.rating;

        return {
          ...course,
          progress,
          rating: displayedRating,
          ratingDistribution: displayedRatingDistribution,
          statusValue,
          statusBadge: getStatusBadge(statusValue, course.statusBadge),
        };
      }),
    [contentProgressByCourse, managedCourses, submittedRatingDistributions]
  );

  const canManageCourses = currentUserRole === 'administrator';
  const categoryOptions = React.useMemo(
    () => categories ?? buildCategories(coursesWithRuntimeState),
    [categories, coursesWithRuntimeState]
  );
  const displayedStats = stats ?? buildDefaultStats(coursesWithRuntimeState, certificationCount);
  const selectedCourseDetails = React.useMemo(
    () => (selectedCourse ? getCourseDetails(selectedCourse) : undefined),
    [selectedCourse]
  );
  const selectedCourseProgress = selectedCourse ? contentProgressByCourse[selectedCourse.id] : undefined;
  const courseFormInitialValues = React.useMemo(
    () => getCourseFormValues(editingCourse ?? undefined),
    [editingCourse]
  );

  const filteredCourses = React.useMemo(() => {
    const normalizedSearch = normalize(search.trim());

    return coursesWithRuntimeState.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        normalize(`${course.title} ${course.description} ${course.instructor ?? ''}`).includes(normalizedSearch);
      const matchesCategory = category === 'all' || course.category === category;
      const matchesStatus = status === 'all' || inferStatusValue(course) === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [category, coursesWithRuntimeState, search, status]);

  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setCourseFormOpen(true);
  };

  const handleOpenEditCourse = (course: ElearningCourse) => {
    setEditingCourse(course);
    setCourseFormOpen(true);
  };

  const handleCancelCourseForm = () => {
    setCourseFormOpen(false);
    setEditingCourse(null);
  };

  const handleSubmitCourseForm = (values: ElearningCourseFormValues) => {
    if (!editingCourse) {
      const createdCourse = buildCourseFromFormValues(values);

      setManagedCourses((currentCourses) => [...currentCourses, createdCourse]);
      onCreateCourse?.(createdCourse, values);
      setStatusMessage(`Formation "${createdCourse.title}" créée.`);
      setCourseFormOpen(false);
      return;
    }

    const updatedCourse = buildCourseFromFormValues(values, editingCourse);

    setManagedCourses((currentCourses) =>
      currentCourses.map((course) => (course.id === editingCourse.id ? updatedCourse : course))
    );
    setSelectedCourse((currentCourse) => (currentCourse?.id === editingCourse.id ? updatedCourse : currentCourse));
    onUpdateCourse?.(updatedCourse, values);
    setStatusMessage(`Formation "${updatedCourse.title}" mise à jour.`);
    setCourseFormOpen(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (course: ElearningCourse) => {
    setManagedCourses((currentCourses) => currentCourses.filter((currentCourse) => currentCourse.id !== course.id));
    setSelectedCourse((currentCourse) => (currentCourse?.id === course.id ? null : currentCourse));
    setSubmittedRatingDistributions((currentDistributions) => {
      const { [course.id]: _removedDistribution, ...nextDistributions } = currentDistributions;
      return nextDistributions;
    });
    setContentProgressByCourse((currentProgress) => {
      const { [course.id]: _removedProgress, ...nextProgress } = currentProgress;
      return nextProgress;
    });
    onDeleteCourse?.(course);
    setStatusMessage(`Formation "${course.title}" supprimée.`);
  };

  return (
    <section
      className={joinClasses('bg-[#f4f2ef] px-6 py-14 text-[#2f3747]', className)}
      {...props}
    >
      <div className="mx-auto max-w-[1130px]">
        {statusMessage && (
          <div
            role="status"
            className="mb-5 flex items-center justify-between gap-4 rounded-md border border-[#b9dfc8] bg-[#eefaf3] px-4 py-3 text-sm font-semibold text-[#167544]"
          >
            <span className="truncate">{statusMessage}</span>
            <button
              type="button"
              aria-label="Fermer le message"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[#167544] transition hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#00a651]/25"
              onClick={() => setStatusMessage(null)}
            >
              <X className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold leading-8 text-[#2f3747]">{title}</h2>
            <p className="text-base leading-6 text-[#5f6470]">{subtitle}</p>
          </div>
          {canManageCourses && (
            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[#1256a6] px-4 text-sm font-semibold text-white transition hover:bg-[#0f4b91] focus:outline-none focus:ring-2 focus:ring-[#1256a6]/30"
              onClick={handleOpenCreateCourse}
            >
              <Plus className="size-4" strokeWidth={2} />
              Nouvelle formation
            </button>
          )}
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-[minmax(300px,1fr)_minmax(240px,0.8fr)_minmax(220px,0.7fr)] xl:grid-cols-[320px_260px_240px]">
          <ElearningSearchInput value={search} onValueChange={setSearch} />
          <ElearningFilterSelect
            value={category}
            onValueChange={setCategory}
            options={categoryOptions}
            leadingIcon={Filter}
            placeholder="Toutes les catégories"
          />
          <ElearningFilterSelect
            value={status}
            onValueChange={setStatus}
            options={statuses}
            placeholder="Tous les statuts"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {displayedStats.map((stat) => (
            <ElearningStatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => {
            const {
              id,
              category: _category,
              statusValue: _statusValue,
              details,
              onAction,
              ratingDistribution,
              progress,
              ...cardProps
            } = course;
            const displayedRatingDistribution =
              submittedRatingDistributions[id] ?? details?.ratingDistribution ?? ratingDistribution;
            const displayedRating = getElearningRatingAverage(displayedRatingDistribution) ?? cardProps.rating;
            const displayedProgress = contentProgressByCourse[id]?.progress ?? progress;

            return (
              <div key={id} className="relative h-full">
                {canManageCourses && (
                  <div className="absolute right-3 top-3 z-10 flex gap-2">
                    <button
                      type="button"
                      aria-label={`Modifier ${course.title}`}
                      className="inline-flex size-8 items-center justify-center rounded-md bg-white/95 text-[#1256a6] shadow-sm transition hover:bg-[#e9f1fb] focus:outline-none focus:ring-2 focus:ring-[#1256a6]/30"
                      onClick={() => handleOpenEditCourse(course)}
                    >
                      <Pencil className="size-4" strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Supprimer ${course.title}`}
                      className="inline-flex size-8 items-center justify-center rounded-md bg-white/95 text-[#c5323a] shadow-sm transition hover:bg-[#fff1f2] focus:outline-none focus:ring-2 focus:ring-[#c5323a]/25"
                      onClick={() => handleDeleteCourse(course)}
                    >
                      <Trash2 className="size-4" strokeWidth={1.8} />
                    </button>
                  </div>
                )}
                <ElearningCourseCard
                  {...cardProps}
                  rating={displayedRating}
                  progress={displayedProgress}
                  onAction={() => {
                    onAction?.();
                    setSelectedCourse(course);
                    onCourseAction?.(course);
                  }}
                />
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="mt-6 rounded-lg border border-[#d8d2ca] bg-white p-8 text-center text-sm text-[#5f6470]">
            {emptyLabel}
          </div>
        )}
      </div>

      {selectedCourse && selectedCourseDetails && (
        <ElearningCourseDetailsModal
          {...selectedCourseDetails}
          rating={
            getElearningRatingAverage(
              submittedRatingDistributions[selectedCourse.id] ??
                selectedCourseDetails.ratingDistribution ??
                selectedCourse.ratingDistribution
            ) ?? selectedCourseDetails.rating
          }
          ratingDistribution={
            submittedRatingDistributions[selectedCourse.id] ??
            selectedCourseDetails.ratingDistribution ??
            selectedCourse.ratingDistribution
          }
          chapters={selectedCourseProgress?.chapters ?? selectedCourseDetails.chapters}
          progress={selectedCourseProgress?.progress ?? selectedCourseDetails.progress}
          completionRating={{
            ...selectedCourseDetails.completionRating,
            onSubmit: (rating) => {
              const ratingSummary = incrementElearningRatingDistribution(
                submittedRatingDistributions[selectedCourse.id] ??
                  selectedCourseDetails.ratingDistribution ??
                  selectedCourse.ratingDistribution,
                rating
              );

              setSubmittedRatingDistributions((currentRatingDistributions) => ({
                ...currentRatingDistributions,
                [selectedCourse.id]: ratingSummary.ratingDistribution,
              }));
              selectedCourseDetails.completionRating?.onSubmit?.(rating);
              onCourseRatingSubmit?.(selectedCourse, rating, ratingSummary);
            },
          }}
          onContentComplete={(payload) => {
            setContentProgressByCourse((currentProgress) => ({
              ...currentProgress,
              [selectedCourse.id]: payload,
            }));
            selectedCourseDetails.onContentComplete?.(payload);
            onCourseContentComplete?.(selectedCourse, payload);
          }}
          open
          onClose={() => setSelectedCourse(null)}
        />
      )}

      <ElearningCourseFormModal
        isOpen={courseFormOpen}
        title={editingCourse ? 'Modifier la formation' : 'Nouvelle formation'}
        submitLabel={editingCourse ? 'Enregistrer' : 'Créer'}
        initialValues={courseFormInitialValues}
        statusOptions={statuses}
        onCancel={handleCancelCourseForm}
        onSubmit={handleSubmitCourseForm}
      />
    </section>
  );
};
