import React from 'react';
import { BookOpen, Clock3, Play, Star, Users } from 'lucide-react';

import { joinClasses } from './calendar/style';
import { ElearningBadge, type ElearningBadgeVariant } from './ElearningBadge';

export interface ElearningCourseBadge {
  label: string;
  variant?: ElearningBadgeVariant;
}

export interface ElearningCourseCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description: string;
  instructor?: string;
  rating?: number | string;
  duration?: string;
  chapters?: number | string;
  learners?: number | string;
  titleBadge?: ElearningCourseBadge;
  levelBadge?: ElearningCourseBadge;
  statusBadge?: ElearningCourseBadge;
  progress?: number;
  deadline?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const clampProgress = (value: number) => Math.min(100, Math.max(0, value));

export const ElearningCourseCard = ({
  title,
  description,
  instructor,
  rating,
  duration,
  chapters,
  learners,
  titleBadge,
  levelBadge,
  statusBadge,
  progress,
  deadline,
  actionLabel = 'Continuer',
  onAction,
  className = '',
  ...props
}: ElearningCourseCardProps) => {
  const normalizedProgress = typeof progress === 'number' ? clampProgress(progress) : undefined;

  return (
    <article
      className={joinClasses(
        'flex h-full flex-col rounded-lg border border-[#d8d2ca] bg-white p-6 text-[#2f3747] shadow-sm',
        className
      )}
      {...props}
    >
      <div className="flex aspect-video w-full items-center justify-center rounded-md bg-[#1a5faa]">
        <Play aria-hidden="true" className="size-12 text-white" strokeWidth={2.2} />
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-base font-semibold leading-6 text-[#172033]">{title}</h3>
        {titleBadge && (
          <ElearningBadge
            label={titleBadge.label}
            variant={titleBadge.variant ?? 'mandatory'}
            className="mt-0.5 shrink-0"
          />
        )}
      </div>

      <p className="mt-3 min-h-12 text-sm leading-5 text-[#5f6470]">{description}</p>

      <div className="mt-5 flex items-center justify-between gap-4 text-sm text-[#5f6470]">
        {instructor ? <span className="truncate">Par {instructor}</span> : <span aria-hidden="true" />}
        {rating !== undefined && (
          <span className="flex shrink-0 items-center gap-1 text-[#2f3747]">
            <Star aria-hidden="true" className="size-4 fill-[#f4b000] text-[#f4b000]" />
            {rating}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-[#5f6470]">
        {duration && (
          <span className="flex min-w-0 items-center gap-1.5">
            <Clock3 aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{duration}</span>
          </span>
        )}
        {chapters !== undefined && (
          <span className="flex min-w-0 items-center gap-1.5">
            <BookOpen aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{chapters} chapitres</span>
          </span>
        )}
        {learners !== undefined && (
          <span className="flex min-w-0 items-center justify-end gap-1.5">
            <Users aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{learners}</span>
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        {levelBadge ? (
          <ElearningBadge label={levelBadge.label} variant={levelBadge.variant ?? 'default'} />
        ) : (
          <span aria-hidden="true" />
        )}
        {statusBadge && <ElearningBadge label={statusBadge.label} variant={statusBadge.variant ?? 'inProgress'} />}
      </div>

      {normalizedProgress !== undefined && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm text-[#2f3747]">
            <span>Progression</span>
            <span>{normalizedProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#cfdbed]">
            <div
              className="h-full rounded-full bg-[#1256a6] transition-[width]"
              style={{ width: `${normalizedProgress}%` }}
            />
          </div>
        </div>
      )}

      {deadline && <p className="mt-4 text-sm text-[#ff3b1f]">Échéance: {deadline}</p>}

      <button
        type="button"
        onClick={onAction}
        className="mt-4 h-9 w-full rounded-md bg-[#1256a6] px-4 text-sm font-semibold text-white transition hover:bg-[#0f4b91] focus:outline-none focus:ring-2 focus:ring-[#1256a6]/30"
      >
        {actionLabel}
      </button>
    </article>
  );
};
