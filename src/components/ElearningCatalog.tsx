import React from 'react';
import { Award, BookOpen, CircleCheck, Filter, Play } from 'lucide-react';

import { joinClasses } from './calendar/style';
import { ElearningCourseCard, type ElearningCourseCardProps } from './ElearningCourseCard';
import { ElearningCourseDetailsModal, type ElearningCourseDetails } from './ElearningCourseDetailsModal';
import { ElearningFilterSelect, type ElearningFilterOption } from './ElearningFilterSelect';
import { ElearningSearchInput } from './ElearningSearchInput';
import { ElearningStatCard, type ElearningStatCardProps } from './ElearningStatCard';

export interface ElearningCourse extends ElearningCourseCardProps {
  id: string;
  category?: string;
  statusValue?: string;
  details?: ElearningCourseDetails;
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
  onCourseAction?: (course: ElearningCourse) => void;
}

const defaultStatuses: ElearningFilterOption[] = [
  { label: 'Tous les statuts', value: 'all' },
  { label: 'Non commencé', value: 'not-started' },
  { label: 'En cours', value: 'in-progress' },
  { label: 'Terminé', value: 'completed' },
];

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

const buildCategories = (courses: ElearningCourse[]) => {
  const uniqueCategories = Array.from(new Set(courses.map((course) => course.category).filter(Boolean)));

  return [
    { label: 'Toutes les catégories', value: 'all' },
    ...uniqueCategories.map((category) => ({ label: category as string, value: category as string })),
  ];
};

const buildDefaultStats = (courses: ElearningCourse[], certificationCount = 0): ElearningStatCardProps[] => [
  {
    label: 'Formations disponibles',
    value: courses.length,
    icon: BookOpen,
    iconColor: '#1b57ff',
  },
  {
    label: 'En cours',
    value: courses.filter((course) => inferStatusValue(course) === 'in-progress').length,
    icon: Play,
    iconColor: '#00a651',
  },
  {
    label: 'Terminées',
    value: courses.filter((course) => inferStatusValue(course) === 'completed').length,
    icon: CircleCheck,
    iconColor: '#8b2cff',
  },
  {
    label: 'Certifications',
    value: certificationCount,
    icon: Award,
    iconColor: '#f4b000',
  },
];

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

export const ElearningCatalog = ({
  title = 'Centre de Formation',
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
  onCourseAction,
  className = '',
  ...props
}: ElearningCatalogProps) => {
  const [search, setSearch] = React.useState(defaultSearch);
  const [category, setCategory] = React.useState(defaultCategory);
  const [status, setStatus] = React.useState(defaultStatus);
  const [selectedCourse, setSelectedCourse] = React.useState<ElearningCourse | null>(null);

  const categoryOptions = React.useMemo(() => categories ?? buildCategories(courses), [categories, courses]);
  const displayedStats = stats ?? buildDefaultStats(courses, certificationCount);

  const filteredCourses = React.useMemo(() => {
    const normalizedSearch = normalize(search.trim());

    return courses.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        normalize(`${course.title} ${course.description} ${course.instructor ?? ''}`).includes(normalizedSearch);
      const matchesCategory = category === 'all' || course.category === category;
      const matchesStatus = status === 'all' || inferStatusValue(course) === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [category, courses, search, status]);

  return (
    <section
      className={joinClasses('bg-[#f4f2ef] px-6 py-14 text-[#2f3747]', className)}
      {...props}
    >
      <div className="mx-auto max-w-[1130px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold leading-8 text-[#2f3747]">{title}</h2>
            <p className="text-base leading-6 text-[#5f6470]">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#2f3747]">
            <Award aria-hidden="true" className="size-5 text-[#f4b000]" />
            <span>{certificationCount} certifications obtenues</span>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-[256px_192px_192px]">
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
            const { id, category: _category, statusValue: _statusValue, details: _details, onAction, ...cardProps } = course;

            return (
              <ElearningCourseCard
                key={id}
                {...cardProps}
                onAction={() => {
                  onAction?.();
                  setSelectedCourse(course);
                  onCourseAction?.(course);
                }}
              />
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="mt-6 rounded-lg border border-[#d8d2ca] bg-white p-8 text-center text-sm text-[#5f6470]">
            {emptyLabel}
          </div>
        )}
      </div>

      {selectedCourse && (
        <ElearningCourseDetailsModal
          {...getCourseDetails(selectedCourse)}
          open
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </section>
  );
};
