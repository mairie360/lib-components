import React from 'react';
import { Circle, CircleCheck, Play, Star, X } from 'lucide-react';

import { joinClasses } from './calendar/style';

export interface ElearningCourseChapter {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
  active?: boolean;
}

export interface ElearningCourseDetails {
  title: string;
  subtitle?: string;
  description: string;
  instructor?: string;
  duration?: string;
  rating?: number | string;
  ratingLabel?: string;
  progress?: number;
  chapters: ElearningCourseChapter[];
  actionLabel?: string;
  onAction?: () => void;
}

export interface ElearningCourseDetailsModalProps
  extends ElearningCourseDetails,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose?: () => void;
  closeLabel?: string;
}

const clampProgress = (value: number) => Math.min(100, Math.max(0, value));

export const ElearningCourseDetailsModal = ({
  open,
  onClose,
  closeLabel = 'Fermer le détail du cours',
  title,
  subtitle = 'Détails et contenu du cours',
  description,
  instructor,
  duration,
  rating,
  ratingLabel,
  progress,
  chapters,
  actionLabel = 'Continuer',
  onAction,
  className = '',
  ...props
}: ElearningCourseDetailsModalProps) => {
  const normalizedProgress = typeof progress === 'number' ? clampProgress(progress) : undefined;
  const titleId = React.useId();
  const subtitleId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitleId}
        className={joinClasses(
          'max-h-[calc(100vh-2rem)] w-full max-w-[960px] overflow-y-auto rounded-lg border border-[#d8d2ca] bg-[#f8f7f5] p-6 text-[#2f3747] shadow-2xl',
          className
        )}
        {...props}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl font-bold leading-7 text-[#2f3747]">
              {title}
            </h2>
            <p id={subtitleId} className="mt-1 text-sm leading-5 text-[#6f6f6f]">
              {subtitle}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              aria-label={closeLabel}
              onClick={onClose}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#6f6f6f] transition hover:bg-[#ece8e2] hover:text-[#2f3747] focus:outline-none focus:ring-2 focus:ring-[#1256a6]/30"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          )}
        </header>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
          <div className="min-w-0">
            <div className="flex aspect-video w-full items-center justify-center rounded-md bg-black">
              <Play aria-hidden="true" className="size-16 text-white" strokeWidth={2.4} />
            </div>

            <section className="mt-5">
              <h3 className="text-base font-bold leading-6 text-[#2f3747]">Description</h3>
              <p className="mt-4 text-sm leading-6 text-[#6f6f6f]">{description}</p>
            </section>

            <dl className="mt-5 grid gap-4 text-sm leading-5 text-[#2f3747] sm:grid-cols-3">
              {instructor && (
                <div className="min-w-0">
                  <dt className="font-semibold">Instructeur</dt>
                  <dd className="mt-1 break-words text-[#5f6470]">{instructor}</dd>
                </div>
              )}
              {duration && (
                <div className="min-w-0">
                  <dt className="font-semibold">Durée</dt>
                  <dd className="mt-1 break-words text-[#5f6470]">{duration}</dd>
                </div>
              )}
              {rating !== undefined && (
                <div className="min-w-0">
                  <dt className="font-semibold">Note</dt>
                  <dd className="mt-1 flex items-start gap-1.5 text-[#5f6470]">
                    <Star aria-hidden="true" className="mt-0.5 size-4 shrink-0 fill-[#f4b000] text-[#f4b000]" />
                    <span className="break-words">
                      {rating}
                      {ratingLabel ? ` ${ratingLabel}` : ''}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <aside className="min-w-0">
            <h3 className="text-base font-bold leading-6 text-[#2f3747]">Chapitres</h3>
            <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {chapters.map((chapter) => {
                const Icon = chapter.completed ? CircleCheck : Circle;

                return (
                  <div
                    key={chapter.id}
                    className={joinClasses(
                      'flex min-h-[58px] items-start gap-3 rounded-md border px-3 py-3',
                      chapter.active
                        ? 'border-[#1256a6]/25 bg-[#e9f1fb]'
                        : 'border-[#e2f1e8] bg-[#eefaf3]'
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className={joinClasses(
                        'mt-0.5 size-5 shrink-0',
                        chapter.completed ? 'text-[#00a651]' : 'text-[#7a8797]'
                      )}
                    />
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold leading-5 text-[#2f3747]">{chapter.title}</p>
                      <p className="mt-0.5 text-xs leading-4 text-[#6f6f6f]">{chapter.duration}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {normalizedProgress !== undefined && (
              <div className="mt-4">
                <div className="mb-2 flex items-start justify-between gap-4 text-sm leading-5 text-[#2f3747]">
                  <span>Progression totale</span>
                  <span className="shrink-0">{normalizedProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#cfdbed]">
                  <div
                    className="h-full rounded-full bg-[#1256a6] transition-[width]"
                    style={{ width: `${normalizedProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onAction}
              className="mt-4 h-10 w-full rounded-md bg-[#1256a6] px-4 text-sm font-semibold text-white transition hover:bg-[#0f4b91] focus:outline-none focus:ring-2 focus:ring-[#1256a6]/30"
            >
              {actionLabel}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};
