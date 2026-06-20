import React from 'react';
import {
  Circle,
  CircleCheck,
  ClipboardCheck,
  ExternalLink,
  FileDown,
  FileText,
  Link as LinkIcon,
  Play,
  Star,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react';

import { joinClasses } from './calendar/style';
import { ElearningCourseRating, type ElearningCourseRatingProps } from './ElearningCourseRating';

export type ElearningCourseContentType = 'video' | 'pdf' | 'document' | 'link' | 'quiz' | 'audio' | 'other';

export interface ElearningCourseContentItem {
  id: string;
  title: string;
  type: ElearningCourseContentType;
  description?: string;
  duration?: string;
  fileName?: string;
  href?: string;
  completed?: boolean;
  required?: boolean;
}

export interface ElearningCourseChapter {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
  active?: boolean;
  contents?: ElearningCourseContentItem[];
}

export type ElearningCourseRatingValue = 1 | 2 | 3 | 4 | 5;

export type ElearningCourseRatingDistribution = Partial<Record<ElearningCourseRatingValue, number>>;

export interface ElearningCourseRatingSummary {
  rating: number;
  ratingCount: number;
  ratingDistribution: ElearningCourseRatingDistribution;
}

export interface ElearningCourseProgressSummary {
  progress: number;
  completedRequiredContents: number;
  totalRequiredContents: number;
  completedChapters: number;
  totalChapters: number;
  completed: boolean;
  chapters: ElearningCourseChapter[];
}

export interface ElearningCourseContentCompletePayload extends ElearningCourseProgressSummary {
  chapter: ElearningCourseChapter;
  content: ElearningCourseContentItem;
}

export interface ElearningCourseDetails {
  title: string;
  subtitle?: string;
  description: string;
  instructor?: string;
  duration?: string;
  rating?: number | string;
  ratingLabel?: string;
  ratingDistribution?: ElearningCourseRatingDistribution;
  progress?: number;
  completed?: boolean;
  completionRating?: ElearningCourseRatingProps;
  chapters: ElearningCourseChapter[];
  actionLabel?: string;
  onAction?: () => void;
  onContentComplete?: (payload: ElearningCourseContentCompletePayload) => void;
}

export interface ElearningCourseDetailsModalProps
  extends ElearningCourseDetails,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose?: () => void;
  closeLabel?: string;
  closeOnOutsideClick?: boolean;
}

const clampProgress = (value: number) => Math.min(100, Math.max(0, value));

const ratingValues = [1, 2, 3, 4, 5] as const;

export const getElearningRatingCount = (ratingDistribution?: ElearningCourseRatingDistribution) =>
  ratingValues.reduce((total, ratingValue) => total + Math.max(0, ratingDistribution?.[ratingValue] ?? 0), 0);

export const getElearningRatingAverage = (ratingDistribution?: ElearningCourseRatingDistribution) => {
  const ratingCount = getElearningRatingCount(ratingDistribution);
  if (ratingCount === 0) return undefined;

  const weightedTotal = ratingValues.reduce(
    (total, ratingValue) => total + ratingValue * Math.max(0, ratingDistribution?.[ratingValue] ?? 0),
    0
  );

  return Math.round((weightedTotal / ratingCount) * 10) / 10;
};

const formatElearningRating = (rating: number | string) => {
  if (typeof rating === 'string') return rating;

  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
};

const getRatingLabel = (ratingCount: number, fallbackLabel?: string) => {
  if (ratingCount === 0) return fallbackLabel;

  return `(${ratingCount} note${ratingCount > 1 ? 's' : ''})`;
};

export const incrementElearningRatingDistribution = (
  ratingDistribution: ElearningCourseRatingDistribution | undefined,
  rating: number
): ElearningCourseRatingSummary => {
  const safeRating = Math.min(5, Math.max(1, Math.round(rating))) as ElearningCourseRatingValue;
  const nextRatingDistribution = ratingValues.reduce<Required<ElearningCourseRatingDistribution>>(
    (distribution, ratingValue) => ({
      ...distribution,
      [ratingValue]: Math.max(0, ratingDistribution?.[ratingValue] ?? 0),
    }),
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  );

  nextRatingDistribution[safeRating] += 1;

  return {
    rating: getElearningRatingAverage(nextRatingDistribution) ?? safeRating,
    ratingCount: getElearningRatingCount(nextRatingDistribution),
    ratingDistribution: nextRatingDistribution,
  };
};

const contentTypeLabels: Record<ElearningCourseContentType, string> = {
  video: 'Vidéo',
  pdf: 'PDF',
  document: 'Document',
  link: 'Lien',
  quiz: 'Quiz',
  audio: 'Audio',
  other: 'Ressource',
};

const contentTypeIcons: Record<ElearningCourseContentType, LucideIcon> = {
  video: Play,
  pdf: FileDown,
  document: FileText,
  link: LinkIcon,
  quiz: ClipboardCheck,
  audio: Volume2,
  other: FileText,
};

const getInitialChapter = (chapters: ElearningCourseChapter[]) =>
  chapters.find((chapter) => chapter.active) ?? chapters.find((chapter) => !chapter.completed) ?? chapters[0];

const getChapterContents = (chapter: ElearningCourseChapter): ElearningCourseContentItem[] =>
  chapter.contents && chapter.contents.length > 0
    ? chapter.contents
    : [
        {
          id: `${chapter.id}-video`,
          title: chapter.title,
          type: 'video',
          duration: chapter.duration,
          description: 'Séquence principale du chapitre',
        },
      ];

const isRequiredContent = (content: ElearningCourseContentItem) => content.required !== false;

const getChapterCompleted = (chapter: ElearningCourseChapter, contents: ElearningCourseContentItem[]) => {
  const requiredContents = contents.filter(isRequiredContent);

  if (requiredContents.length === 0) return Boolean(chapter.completed);

  return requiredContents.every((content) => content.completed);
};

const normalizeChaptersForProgress = (chapters: ElearningCourseChapter[]) =>
  chapters.map((chapter) => {
    const contents = getChapterContents(chapter).map((content) => ({
      ...content,
      completed: content.completed ?? chapter.completed ?? false,
      required: content.required ?? true,
    }));
    const completed = getChapterCompleted(chapter, contents);

    return {
      ...chapter,
      completed,
      active: completed ? false : chapter.active,
      contents,
    };
  });

export const getElearningCourseProgressSummary = (
  chapters: ElearningCourseChapter[]
): ElearningCourseProgressSummary => {
  const requiredContents = chapters.flatMap((chapter) => getChapterContents(chapter).filter(isRequiredContent));
  const completedRequiredContents = requiredContents.filter((content) => content.completed).length;
  const totalRequiredContents = requiredContents.length;
  const progress =
    totalRequiredContents === 0 ? 0 : Math.round((completedRequiredContents / totalRequiredContents) * 100);
  const completedChapters = chapters.filter((chapter) => getChapterCompleted(chapter, getChapterContents(chapter))).length;

  return {
    progress,
    completedRequiredContents,
    totalRequiredContents,
    completedChapters,
    totalChapters: chapters.length,
    completed: totalRequiredContents > 0 && completedRequiredContents === totalRequiredContents,
    chapters,
  };
};

const isCourseCompleted = (
  completed: boolean | undefined,
  normalizedProgress: number | undefined,
  chapters: ElearningCourseChapter[]
) => {
  if (completed !== undefined) return completed;

  return normalizedProgress === 100 || (chapters.length > 0 && chapters.every((chapter) => chapter.completed));
};

export const ElearningCourseDetailsModal = ({
  open,
  onClose,
  closeLabel = 'Fermer le détail du cours',
  closeOnOutsideClick = true,
  title,
  subtitle = 'Détails et contenu du cours',
  description,
  instructor,
  duration,
  rating,
  ratingLabel,
  ratingDistribution,
  progress,
  completed,
  completionRating,
  chapters,
  actionLabel = 'Continuer',
  onAction,
  onContentComplete,
  className = '',
  ...props
}: ElearningCourseDetailsModalProps) => {
  const initialChapters = React.useMemo(() => normalizeChaptersForProgress(chapters), [chapters]);
  const initialProgress = typeof progress === 'number' ? clampProgress(progress) : getElearningCourseProgressSummary(initialChapters).progress;
  const [localChapters, setLocalChapters] = React.useState<ElearningCourseChapter[]>(initialChapters);
  const [localProgress, setLocalProgress] = React.useState(initialProgress);
  const initialChapter = getInitialChapter(localChapters);
  const canRateCourse = isCourseCompleted(completed, localProgress, localChapters);
  const [selectedChapterId, setSelectedChapterId] = React.useState(() => getInitialChapter(initialChapters)?.id ?? '');
  const [localRatingDistribution, setLocalRatingDistribution] = React.useState(ratingDistribution);
  const titleId = React.useId();
  const subtitleId = React.useId();
  const averageRating = getElearningRatingAverage(localRatingDistribution);
  const ratingCount = getElearningRatingCount(localRatingDistribution);
  const displayedRating = averageRating ?? rating;
  const displayedRatingLabel = getRatingLabel(ratingCount, ratingLabel);

  const chaptersStateKey = chapters
    .map((chapter) =>
      [
        chapter.id,
        chapter.completed ? 'completed' : 'pending',
        getChapterContents(chapter)
          .map((content) => `${content.id}:${content.completed ? 'completed' : 'pending'}:${content.required === false ? 'optional' : 'required'}`)
          .join(','),
      ].join(':')
    )
    .join('|');

  React.useEffect(() => {
    if (!open) return;

    const nextChapters = normalizeChaptersForProgress(chapters);
    const nextProgress =
      typeof progress === 'number' ? clampProgress(progress) : getElearningCourseProgressSummary(nextChapters).progress;

    setLocalChapters(nextChapters);
    setLocalProgress(nextProgress);
    setSelectedChapterId((currentId) => {
      if (nextChapters.some((chapter) => chapter.id === currentId)) {
        return currentId;
      }

      return getInitialChapter(nextChapters)?.id ?? '';
    });
  }, [chaptersStateKey, open, progress]);

  React.useEffect(() => {
    setLocalRatingDistribution(ratingDistribution);
  }, [ratingDistribution, title]);

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

  const handleRatingSubmit = (newRating: number) => {
    const nextRatingSummary = incrementElearningRatingDistribution(localRatingDistribution, newRating);

    setLocalRatingDistribution(nextRatingSummary.ratingDistribution);
    completionRating?.onSubmit?.(newRating);
  };

  const handleContentComplete = (chapterId: string, contentId: string) => {
    let completedChapter: ElearningCourseChapter | undefined;
    let completedContent: ElearningCourseContentItem | undefined;
    let wasAlreadyCompleted = false;

    const nextChapters = localChapters.map((chapter) => {
      if (chapter.id !== chapterId) return chapter;

      const contents = getChapterContents(chapter).map((content) => {
        if (content.id !== contentId) return content;

        wasAlreadyCompleted = Boolean(content.completed);
        completedContent = {
          ...content,
          completed: true,
        };

        return completedContent;
      });
      const chapterCompleted = getChapterCompleted(chapter, contents);

      completedChapter = {
        ...chapter,
        active: chapterCompleted ? false : chapter.active,
        completed: chapterCompleted,
        contents,
      };

      return completedChapter;
    });

    if (!completedChapter || !completedContent || wasAlreadyCompleted) {
      const progressSummary = getElearningCourseProgressSummary(nextChapters);

      setLocalChapters(nextChapters);
      setLocalProgress(progressSummary.progress);
      return;
    }

    const progressSummary = getElearningCourseProgressSummary(nextChapters);

    setLocalChapters(nextChapters);
    setLocalProgress(progressSummary.progress);
    onContentComplete?.({
      ...progressSummary,
      chapter: completedChapter,
      content: completedContent,
    });
  };

  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnOutsideClick || event.target !== event.currentTarget) return;

    onClose?.();
  };

  const selectedChapter = localChapters.find((chapter) => chapter.id === selectedChapterId) ?? initialChapter;
  const selectedContents = selectedChapter ? getChapterContents(selectedChapter) : [];
  const primaryContent = selectedContents.find((content) => content.type === 'video') ?? selectedContents[0];
  const PrimaryContentIcon = primaryContent ? contentTypeIcons[primaryContent.type] : Play;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      onMouseDown={handleBackdropMouseDown}
    >
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
            <div className="rounded-md bg-black p-5 text-white">
              <div className="flex aspect-video w-full items-center justify-center rounded">
                <div className="text-center">
                  <PrimaryContentIcon aria-hidden="true" className="mx-auto size-16" strokeWidth={2.4} />
                  {primaryContent && (
                    <div className="mt-4 max-w-md">
                      <p className="text-sm font-semibold leading-5">{contentTypeLabels[primaryContent.type]}</p>
                      <p className="mt-1 break-words text-base font-semibold leading-6">{primaryContent.title}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedChapter && (
              <section className="mt-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="break-words text-base font-bold leading-6 text-[#2f3747]">
                      {selectedChapter.title}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-[#6f6f6f]">{selectedChapter.duration}</p>
                  </div>
                  <span className="shrink-0 rounded-md border border-[#d8d2ca] bg-white px-2 py-1 text-xs font-semibold text-[#5f6470]">
                    {selectedContents.length} contenu{selectedContents.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {selectedContents.map((content) => {
                    const ContentIcon = contentTypeIcons[content.type];
                    const contentCompleted = Boolean(content.completed);
                    const requiredContent = isRequiredContent(content);

                    return (
                      <div
                        key={content.id}
                        className={joinClasses(
                          'flex items-start gap-3 rounded-md border bg-white p-3',
                          contentCompleted ? 'border-[#b9dfc8]' : 'border-[#d8d2ca]'
                        )}
                      >
                        <div
                          className={joinClasses(
                            'flex size-10 shrink-0 items-center justify-center rounded-md',
                            contentCompleted ? 'bg-[#eefaf3] text-[#00a651]' : 'bg-[#e9f1fb] text-[#1256a6]'
                          )}
                        >
                          {contentCompleted ? (
                            <CircleCheck aria-hidden="true" className="size-5" />
                          ) : (
                            <ContentIcon aria-hidden="true" className="size-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold leading-5 text-[#2f3747]">
                                {content.title}
                              </p>
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase leading-4 text-[#4b908d]">
                                <span>
                                  {contentTypeLabels[content.type]}
                                  {content.duration ? ` - ${content.duration}` : ''}
                                </span>
                                {!requiredContent && <span className="text-[#8a7b6d]">Optionnel</span>}
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              {content.href && (
                                <a
                                  href={content.href}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#1256a6] transition hover:bg-[#e9f1fb] focus:outline-none focus:ring-2 focus:ring-[#1256a6]/30"
                                >
                                  Ouvrir
                                  <ExternalLink aria-hidden="true" className="size-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                aria-label={
                                  contentCompleted
                                    ? `${content.title} terminé`
                                    : `Marquer ${content.title} comme terminé`
                                }
                                disabled={contentCompleted}
                                onClick={() => handleContentComplete(selectedChapter.id, content.id)}
                                className="inline-flex items-center gap-1 rounded-md border border-[#d8d2ca] bg-white px-2 py-1 text-xs font-semibold text-[#2f3747] transition hover:border-[#1256a6] hover:bg-[#e9f1fb] focus:outline-none focus:ring-2 focus:ring-[#1256a6]/30 disabled:border-[#b9dfc8] disabled:bg-[#eefaf3] disabled:text-[#00a651]"
                              >
                                {contentCompleted ? 'Terminé' : 'Marquer comme terminé'}
                              </button>
                            </div>
                          </div>
                          {content.description && (
                            <p className="mt-2 break-words text-sm leading-5 text-[#6f6f6f]">{content.description}</p>
                          )}
                          {content.fileName && (
                            <p className="mt-2 break-words text-xs leading-4 text-[#6f6f6f]">{content.fileName}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mt-5">
              <h3 className="text-base font-bold leading-6 text-[#2f3747]">Description</h3>
              <p className="mt-3 text-sm leading-6 text-[#6f6f6f]">{description}</p>
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
              {displayedRating !== undefined && (
                <div className="min-w-0">
                  <dt className="font-semibold">Note</dt>
                  <dd className="mt-1 flex items-start gap-1.5 text-[#5f6470]">
                    <Star aria-hidden="true" className="mt-0.5 size-4 shrink-0 fill-[#f4b000] text-[#f4b000]" />
                    <span className="break-words">
                      {formatElearningRating(displayedRating)}
                      {displayedRatingLabel ? ` ${displayedRatingLabel}` : ''}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <aside className="min-w-0">
            <h3 className="text-base font-bold leading-6 text-[#2f3747]">Chapitres</h3>
            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {localChapters.map((chapter) => {
                const Icon = chapter.completed ? CircleCheck : Circle;
                const selected = chapter.id === selectedChapter?.id;

                return (
                  <button
                    key={chapter.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedChapterId(chapter.id)}
                    className={joinClasses(
                      'flex min-h-[58px] w-full items-start gap-3 rounded-md border px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#1256a6]/30',
                      selected
                        ? 'border-[#1256a6] bg-[#e9f1fb] shadow-sm'
                        : chapter.active
                          ? 'border-[#1256a6]/25 bg-[#e9f1fb] hover:border-[#1256a6]/50'
                          : 'border-[#e2f1e8] bg-[#eefaf3] hover:border-[#b9dfc8]'
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className={joinClasses(
                        'mt-0.5 size-5 shrink-0',
                        chapter.completed ? 'text-[#00a651]' : selected ? 'text-[#1256a6]' : 'text-[#7a8797]'
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold leading-5 text-[#2f3747]">{chapter.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-4 text-[#6f6f6f]">
                        <span>{chapter.duration}</span>
                        <span>
                          {getChapterContents(chapter).length} contenu
                          {getChapterContents(chapter).length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {localProgress !== undefined && (
              <div className="mt-4">
                <div className="mb-2 flex items-start justify-between gap-4 text-sm leading-5 text-[#2f3747]">
                  <span>Progression totale</span>
                  <span className="shrink-0">{localProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#cfdbed]">
                  <div
                    className="h-full rounded-full bg-[#1256a6] transition-[width]"
                    style={{ width: `${localProgress}%` }}
                  />
                </div>
              </div>
            )}

            {canRateCourse && (
              <ElearningCourseRating
                {...completionRating}
                className={joinClasses('mt-4', completionRating?.className ?? '')}
                onSubmit={handleRatingSubmit}
              />
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
