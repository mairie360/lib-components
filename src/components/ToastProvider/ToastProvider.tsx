'use client';

import React, { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Tone } from '@mairie360/lib-components/theme';
import { ToastAnnouncementContext, type ToastProps } from '../Toast';
import { TimedToast } from './components/TimedToast';
import { isDanger, type CloseReason, type Entry } from './toast-entries';
import { componentMarker } from '../component-marker';

export interface ToastOptions extends Pick<ToastProps, 'message' | 'title' | 'tone' | 'variant' | 'closeLabel' | 'action'> {
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
export interface ToastProviderProps {
  children: React.ReactNode;
  regionLabel: string;
  closeLabel?: string;
  defaultDuration?: number | null;
  /**
   * MAIR-906: where the toasts float, over the page without moving it. `bottom-end` (default) sits
   * bottom right, above the AppShell footer; `top-end` sits top right, under the top bar.
   */
  placement?: ToastPlacement;
}
export type ToastPlacement = 'bottom-end' | 'top-end';
const GAP = 16;
const TOP_BAR = 64;

/** Height of the shell footer the toasts must not cover (0 outside the AppShell), kept up to date. */
function useFooterHeight(enabled: boolean) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const footer = document.querySelector<HTMLElement>('.app-shell-footer, .app-accessible-footer');
    if (!footer) return;
    const measure = () => setHeight(Math.ceil(footer.getBoundingClientRect().height));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure); observer.observe(footer);
    return () => observer.disconnect();
  }, [enabled]);
  return height;
}
const Context = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children, regionLabel, closeLabel = 'Fermer la notification', defaultDuration = null, placement = 'bottom-end' }: ToastProviderProps) {
  const prefix = useId(); const sequence = useRef(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [windowActive, setWindowActive] = useState(() => typeof document === 'undefined' || document.hasFocus());
  const [visible, setVisible] = useState(true);
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const footerHeight = useFooterHeight(placement === 'bottom-end' && entries.length > 0);
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
    <div {...componentMarker('ToastProvider')} className="sr-only" role="status" aria-live="polite" aria-atomic="false" aria-relevant="additions">{entries.filter(entry => !isDanger(entry.options)).map(entry => <div key={entry.id}>{entry.options.title ? `${entry.options.title} ` : ''}{entry.options.message}</div>)}</div>
    <div {...componentMarker('ToastProvider')} className="sr-only" role="alert" aria-live="assertive" aria-atomic="false" aria-relevant="additions">{entries.filter(entry => isDanger(entry.options)).map(entry => <div key={entry.id}>{entry.options.title ? `${entry.options.title} ` : ''}{entry.options.message}</div>)}</div>
    <ToastAnnouncementContext.Provider value={false}>{entries.length > 0 && <section {...componentMarker('ToastProvider')} aria-label={regionLabel} data-placement={placement} className="fixed inset-x-4 z-50 max-h-[70vh] overflow-y-auto sm:left-auto sm:right-6 sm:w-96"
      style={placement === 'bottom-end' ? { bottom: footerHeight + GAP } : { top: TOP_BAR + GAP }}><ol className="space-y-3">{entries.map(entry => <li key={entry.id}><TimedToast entry={entry} inactive={!windowActive || !visible} closeLabel={closeLabel} close={close} register={register} /></li>)}</ol></section>}</ToastAnnouncementContext.Provider></Context.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(Context);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
