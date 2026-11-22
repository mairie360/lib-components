'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '../Button';
import { dialogBackdropClass, useDialogFocus } from '../Modal';
import { StepProgress, type StepProgressTone } from '../StepProgress';
import { componentMarker, withoutMarker } from '../component-marker';
import { OnboardingArt, type OnboardingArtName } from './components/OnboardingArt';

export type { OnboardingArtName } from './components/OnboardingArt';
export type OnboardingResult = 'done' | 'skip';

export interface OnboardingSlide {
  title: string;
  text: string;
  /** One of the lib illustrations, or your own node (decorative). */
  art?: OnboardingArtName | React.ReactNode;
}

/** The five slides of the Mairie360 tour (Figma « Onboarding »). */
export const onboardingSlides: readonly OnboardingSlide[] = [
  { art: 'welcome', title: 'Bienvenue dans Mairie360', text: 'L’outil de gestion de votre mairie : vos services, vos projets et vos échanges au même endroit.' },
  { art: 'dashboard', title: 'Tableau de bord', text: 'Votre journée en un coup d’œil : les demandes à traiter, les projets en cours et les prochaines réunions.' },
  { art: 'projects', title: 'Projets et calendrier', text: 'Suivez chaque projet en tâches, planifiez les réunions du conseil et partagez les échéances avec vos équipes.' },
  { art: 'messaging', title: 'Restez informé', text: 'Échangez avec les services dans la messagerie. La cloche vous prévient des messages, tâches et réunions qui vous concernent.' },
  { art: 'training', title: 'Formez-vous à votre rythme', text: 'L’e-learning propose des formations courtes pour prendre en main Mairie360 et les règles de la mairie. Votre progression est enregistrée.' },
];

export interface OnboardingProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** `done` after « Commencer » on the last slide, `skip` after « Passer » or Escape. */
  onDone: (result: OnboardingResult) => void;
  slides?: readonly OnboardingSlide[];
  initialSlide?: number;
  /** Shows the tour as a modal dialog over a veil (focus kept inside, Escape = Passer). */
  modal?: boolean;
  /** Colour of the step dashes. */
  tone?: StepProgressTone;
}

const artNames: readonly string[] = ['welcome', 'dashboard', 'projects', 'messaging', 'training'];

/**
 * Presentation of the tool in slides (MAIR-1097, Figma `Onboarding`): illustration on
 * `--mairie-illustration-background`, title and text, clickable StepProgress, Précédent / Suivant
 * (« Commencer » on the last slide) and « Passer ». Arrow keys change slide, Escape skips. The first slide
 * plays the logo intro once; slides slide in from the side of the move, never under reduced motion.
 */
export function Onboarding({ onDone, slides = onboardingSlides, initialSlide = 0, modal = false, tone = 'accent', className = '', style, onKeyDown, ...props }: OnboardingProps) {
  const titleId = React.useId();
  const panel = React.useRef<HTMLElement>(null);
  const last = Math.max(0, slides.length - 1);
  const [current, setCurrent] = React.useState(() => Math.min(Math.max(0, initialSlide), last));
  const [direction, setDirection] = React.useState<'next' | 'previous' | null>(null);
  // The logo intro is one-shot: once the first slide was shown, coming back shows the logo still.
  const [introPlayed, setIntroPlayed] = React.useState(false);
  const slide = slides[current];
  const isLast = current === last;
  useDialogFocus(modal, panel, () => onDone('skip'));

  const go = (index: number) => {
    const next = Math.min(Math.max(0, index), last);
    if (next === current) return;
    if (current === 0) setIntroPlayed(true);
    setDirection(next > current ? 'next' : 'previous');
    setCurrent(next);
  };
  const motionClass = direction === 'next' ? 'mairie-slide-next' : direction === 'previous' ? 'mairie-slide-previous' : '';
  const art = slide?.art ?? null;

  const card = (
    <section
      {...withoutMarker(props)}
      {...(modal ? {} : componentMarker('Onboarding', props))}
      ref={panel}
      role={modal ? 'dialog' : undefined}
      aria-modal={modal || undefined}
      aria-roledescription={modal ? undefined : 'carrousel'}
      aria-labelledby={titleId}
      tabIndex={-1}
      className={`relative flex w-full flex-col overflow-hidden border border-[var(--mairie-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)] outline-none ${className}`.trim()}
      style={{ maxWidth: 560, borderRadius: 'var(--mairie-radius-xl)', boxShadow: 'var(--mairie-shadow-pop)', ...style }}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.defaultPrevented || (event.target as Element).closest?.('input, textarea, select')) return;
        if (event.key === 'ArrowRight') { event.preventDefault(); go(current + 1); }
        else if (event.key === 'ArrowLeft') { event.preventDefault(); go(current - 1); }
        // The modal hook already turns Escape into « Passer ».
        else if (event.key === 'Escape' && !modal) { event.preventDefault(); onDone('skip'); }
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
        <span aria-live="polite" className="text-[var(--mairie-muted)] tabular-nums" style={{ fontSize: 'var(--mairie-text-s)' }}>Étape {current + 1} sur {slides.length}</span>
        <Button variant="ghost" tone="neutral" size="s" label="Passer" onClick={() => onDone('skip')} style={{ visibility: isLast ? 'hidden' : undefined }} />
      </div>
      <div data-onboarding-stage className="relative mx-4 mt-3 overflow-hidden border border-[var(--mairie-border)] bg-[var(--mairie-illustration-background)]" style={{ height: 'clamp(170px, 32vw, 210px)', borderRadius: 'var(--mairie-radius-l)' }}>
        <div key={current} aria-hidden="true" className={`absolute inset-0 grid place-items-center ${motionClass}`.trim()}>
          {typeof art === 'string' && artNames.includes(art) ? <OnboardingArt name={art as OnboardingArtName} intro={current === 0 && !introPlayed} /> : art}
        </div>
      </div>
      <div key={`text-${current}`} className={`px-[22px] pb-1.5 pt-[18px] ${motionClass}`.trim()} style={{ minHeight: 124, animationDelay: direction ? '60ms' : undefined }}>
        <h2 id={titleId} className="m-0 font-semibold tracking-[-0.015em]" style={{ fontSize: 'var(--mairie-text-xl)' }}>{slide?.title}</h2>
        <p className="mb-0 mt-1.5 max-w-[52ch] text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-m)' }}>{slide?.text}</p>
      </div>
      <div className="px-[22px] pb-1 pt-4">
        <StepProgress steps={slides.map(item => item.title)} current={current} onStepChange={go} tone={tone} label="Étapes de la présentation" />
      </div>
      <div className="flex items-center gap-2 px-4 pb-4 pt-3">
        <Button variant="outline" tone="neutral" icon={ChevronLeft} label="Précédent" onClick={() => go(current - 1)} style={{ visibility: current === 0 ? 'hidden' : undefined }} />
        <span className="flex-1" />
        {isLast
          ? <Button label="Commencer" onClick={() => onDone('done')} />
          : <Button label="Suivant" icon={ChevronRight} iconPosition="end" onClick={() => go(current + 1)} />}
      </div>
    </section>
  );
  if (!modal) return card;
  return <div {...componentMarker('Onboarding', props)} className={`${dialogBackdropClass} flex items-center justify-center p-4`}>{card}</div>;
}
