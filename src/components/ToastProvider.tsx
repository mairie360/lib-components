'use client';

import React, { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Tone } from '@mairie360/lib-components/theme';
import { Toast, ToastAnnouncementContext, toastTone, type ToastProps } from './Toast';

export interface ToastOptions extends Pick<ToastProps, 'message' | 'title' | 'tone' | 'variant' | 'closeLabel'> {
  /** Persistent by default. Danger toasts always remain until dismissed. */
  duration?: number | null;
  /** Countdown bar under a timed toast (default: shown when a duration applies). */
  showProgress?: boolean;
}
type ToneShortcut = Omit<ToastOptions, 'tone' | 'variant' | 'message'> & { message?: string };
export interface ToastContextValue {
  notify: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  /** Figma Toast/Error: persistent, announced assertively. */
  error: (message: string, options?: ToneShortcut) => string;
  /** Figma Toast/Success: 5 s with countdown. */
  success: (message: string, options?: ToneShortcut) => string;
  /** Figma Toast/Warning: persistent. */
  warning: (message: string, options?: ToneShortcut) => string;
  /** Figma Toast/Info: 5 s with countdown. */
  info: (message: string, options?: ToneShortcut) => string;
}
export const TOAST_DEFAULT_DURATION = 5000;
const isDanger = (options: Pick<ToastOptions, 'tone' | 'variant'>) => toastTone(options.tone, options.variant) === 'danger';
export interface ToastProviderProps {
  children: React.ReactNode;
  regionLabel: string;
  closeLabel?: string;
  defaultDuration?: number | null;
}
interface Entry { id: string; options: ToastOptions; trigger: HTMLElement | null }
type CloseReason = 'manual' | 'programmatic' | 'timeout';
const Context = createContext<ToastContextValue | null>(null);

function TimedToast({ entry, inactive, closeLabel, close, register }: {
  entry: Entry; inactive: boolean; closeLabel: string; close: (id: string, reason: CloseReason) => void;
  register: (id: string, node: HTMLDivElement | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { duration, showProgress, ...toastProps } = entry.options;
  const total = !isDanger(entry.options) && typeof duration === 'number' && Number.isFinite(duration) && duration > 0 ? duration : null;
  const remaining = useRef(total);
  const paused = inactive || hovered || focused;
  // The countdown bar follows the same timer: it runs to 0 while the timer runs and freezes while paused.
  const [bar, setBar] = useState<{ progress: number; duration: number }>({ progress: 1, duration: 0 });
  useEffect(() => {
    if (paused || remaining.current === null) { if (remaining.current !== null && total) setBar({ progress: remaining.current / total, duration: 0 }); return; }
    const started = Date.now();
    setBar({ progress: 0, duration: remaining.current });
    const timer = setTimeout(() => close(entry.id, 'timeout'), remaining.current);
    return () => { clearTimeout(timer); remaining.current = Math.max(0, remaining.current! - (Date.now() - started)); };
  }, [close, entry.id, paused, total]);
  const progress = total && (showProgress ?? true) ? bar : null;
  return <Toast {...toastProps} ref={node => register(entry.id, node)} closeLabel={entry.options.closeLabel ?? closeLabel} progress={progress?.progress} progressDuration={progress?.duration}
    onClose={() => close(entry.id, 'manual')} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }} />;
}

export function ToastProvider({ children, regionLabel, closeLabel = 'Fermer la notification', defaultDuration = null }: ToastProviderProps) {
  const prefix = useId(); const sequence = useRef(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [windowActive, setWindowActive] = useState(() => typeof document === 'undefined' || document.hasFocus());
  const [visible, setVisible] = useState(true);
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const entriesRef = useRef(entries);
  useLayoutEffect(() => { entriesRef.current = entries; }, [entries]);
  const restoration = useRef<{ trigger: HTMLElement; previous: Element } | null>(null);
  useEffect(() => {
    const blur = () => setWindowActive(false); const focus = () => setWindowActive(true);
    const visibility = () => setVisible(document.visibilityState !== 'hidden');
    visibility(); window.addEventListener('blur', blur); window.addEventListener('focus', focus); document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('blur', blur); window.removeEventListener('focus', focus); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  const register = useCallback((id: string, node: HTMLDivElement | null) => { if (node) nodes.current.set(id, node); else nodes.current.delete(id); }, []);
  const close = useCallback((id: string, reason: CloseReason) => {
    const entry = entriesRef.current.find(item => item.id === id); const active = document.activeElement;
    if (reason === 'manual' && entry?.trigger && active && nodes.current.get(id)?.contains(active)) restoration.current = { trigger: entry.trigger, previous: active };
    setEntries(current => current.filter(item => item.id !== id));
  }, []);
  useLayoutEffect(() => {
    const pending = restoration.current; restoration.current = null;
    if (!pending) return;
    const { trigger, previous } = pending;
    if ((document.activeElement === document.body || document.activeElement === previous) && trigger.isConnected && !trigger.matches(':disabled, [aria-disabled="true"]') && !trigger.closest('[hidden], [inert], [aria-hidden="true"]')) trigger.focus();
  }, [entries]);
  const notify = useCallback((options: ToastOptions) => {
    const id = `${prefix}-${++sequence.current}`; const active = document.activeElement;
    const trigger = active instanceof HTMLElement && active !== document.body && active !== document.documentElement ? active : null;
    setEntries(current => [...current, { id, options: { ...options, duration: options.duration === undefined ? defaultDuration : options.duration }, trigger }]);
    return id;
  }, [defaultDuration, prefix]);
  const dismiss = useCallback((id: string) => close(id, 'programmatic'), [close]);
  const shortcut = useCallback((tone: Tone, timed: boolean, fallback: string) => (message: string, options: ToneShortcut = {}) =>
    notify({ ...options, message: message || options.message || fallback, tone, duration: options.duration === undefined ? (timed ? TOAST_DEFAULT_DURATION : null) : options.duration }), [notify]);
  const value = useMemo(() => ({
    notify, dismiss,
    error: shortcut('danger', false, 'Une erreur est survenue.'),
    success: shortcut('success', true, 'Action effectuée.'),
    warning: shortcut('warning', false, 'Attention'),
    info: shortcut('info', true, 'Information'),
  }), [notify, dismiss, shortcut]);
  return <Context.Provider value={value}>{children}
    {/* Mounted before any receipt. Additions announce complete messages; removing a
        toast also removes its hidden text, without keeping a second history. */}
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="false" aria-relevant="additions">{entries.filter(entry => !isDanger(entry.options)).map(entry => <div key={entry.id}>{entry.options.title ? `${entry.options.title} ` : ''}{entry.options.message}</div>)}</div>
    <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="false" aria-relevant="additions">{entries.filter(entry => isDanger(entry.options)).map(entry => <div key={entry.id}>{entry.options.title ? `${entry.options.title} ` : ''}{entry.options.message}</div>)}</div>
    <ToastAnnouncementContext.Provider value={false}>{entries.length > 0 && <section aria-label={regionLabel} className="fixed inset-x-4 top-4 z-50 max-h-[80vh] overflow-y-auto sm:left-auto sm:w-96"><ol className="space-y-3">{entries.map(entry => <li key={entry.id}><TimedToast entry={entry} inactive={!windowActive || !visible} closeLabel={closeLabel} close={close} register={register} /></li>)}</ol></section>}</ToastAnnouncementContext.Provider></Context.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(Context);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
