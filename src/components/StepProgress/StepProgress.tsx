'use client';

import React from 'react';

import { componentMarker } from '../component-marker';

export interface StepProgressStep {
  label: string;
  /** Shown as « (facultative) » in the accessible name of the step. */
  optional?: boolean;
}
export type StepProgressTone = 'accent' | 'dashboard' | 'projects' | 'calendar' | 'messaging' | 'workflows' | 'training';
export type StepProgressSize = 's' | 'm';

export interface StepProgressProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'onChange'> {
  /** The steps: a count (« Étape 1 », « Étape 2 »…) or their names; any number of steps. */
  steps: number | readonly (string | StepProgressStep)[];
  /** Index of the current step, from 0. */
  current: number;
  /** Makes every dash a button that moves to its step (arrow keys move from step to step). */
  onStepChange?: (index: number) => void;
  /** Fill colour: the accent, or the identity colour of a module. */
  tone?: StepProgressTone;
  /** Dash height: s 4 px, m 8 px. */
  size?: StepProgressSize;
  /** Accessible name of the list. */
  label?: string;
}

/** The steps as named objects, whatever form `steps` takes. */
export function stepProgressSteps(steps: StepProgressProps['steps']): StepProgressStep[] {
  if (typeof steps === 'number') return Array.from({ length: Math.max(0, Math.trunc(steps)) }, (_, index) => ({ label: `Étape ${index + 1}` }));
  return steps.map(step => (typeof step === 'string' ? { label: step } : step));
}

const heights: Record<StepProgressSize, number> = { s: 4, m: 8 };
const gaps: Record<StepProgressSize, number> = { s: 6, m: 8 };

/**
 * Progress through a sequence of steps (MAIR-1097, Figma `Base/StepProgress`): one rounded dash per step,
 * filled up to the current one in the accent or a module colour. With `onStepChange` every dash is a
 * button; the current step carries `aria-current="step"`. Used by Onboarding and the Modal step header.
 */
export function StepProgress({ steps, current, onStepChange, tone = 'accent', size = 'm', label = 'Progression', className = '', style, ...props }: StepProgressProps) {
  const items = stepProgressSteps(steps);
  const index = Math.min(Math.max(0, Math.trunc(current)), Math.max(0, items.length - 1));
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([]);
  const moved = React.useRef(false);
  React.useEffect(() => {
    // The arrow keys moved the step: focus follows it once the new current step is rendered.
    if (moved.current) { moved.current = false; buttons.current[index]?.focus(); }
  }, [index]);
  const fill = tone === 'accent' ? 'var(--mairie-accent)' : `var(--mairie-module-${tone})`;
  const go = (next: number) => { if (onStepChange && next >= 0 && next < items.length && next !== index) onStepChange(next); };
  return (
    <ol
      {...props}
      {...componentMarker('StepProgress', props)}
      aria-label={label}
      data-size={size}
      data-tone={tone}
      className={`m-0 flex w-full list-none items-center p-0 ${className}`.trim()}
      style={{ gap: gaps[size], ...style }}
      onKeyDown={event => {
        props.onKeyDown?.(event);
        if (!onStepChange || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End')) return;
        // The steps own their arrow keys: a surrounding carousel must not move twice.
        event.preventDefault(); event.stopPropagation();
        moved.current = true;
        go(event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1));
      }}
    >
      {items.map((step, position) => {
        const state = position < index ? 'done' : position === index ? 'current' : 'upcoming';
        const name = `Étape ${position + 1} sur ${items.length} : ${step.label}${step.optional ? ' (facultative)' : ''}${state === 'done' ? ', terminée' : ''}`;
        const dash = (
          <span aria-hidden="true" className="relative block w-full overflow-hidden rounded-full bg-[var(--mairie-border)] transition-colors group-hover:bg-[var(--mairie-control-border)]" style={{ height: heights[size] }}>
            <span
              data-fill
              className="absolute inset-0 origin-left rounded-full"
              style={{ background: fill, transform: state === 'upcoming' ? 'scaleX(0)' : 'scaleX(1)', transition: 'transform var(--mairie-motion-slow) var(--mairie-ease-standard)' }}
            />
          </span>
        );
        return (
          <li key={position} data-state={state} aria-current={!onStepChange && state === 'current' ? 'step' : undefined} className="min-w-0 flex-1">
            {onStepChange ? (
              <button
                ref={node => { buttons.current[position] = node; }}
                type="button"
                aria-label={name}
                aria-current={state === 'current' ? 'step' : undefined}
                tabIndex={state === 'current' ? 0 : -1}
                onClick={() => go(position)}
                className="group block w-full cursor-pointer rounded-full border-0 bg-transparent px-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]"
                style={{ paddingBlock: 10 }}
              >
                {dash}
              </button>
            ) : (
              <>{dash}<span className="sr-only">{name}</span></>
            )}
          </li>
        );
      })}
    </ol>
  );
}
