'use client';

import React, { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Toast, ToastAnnouncementContext, type ToastProps } from './Toast';

export interface ToastOptions extends Pick<ToastProps, 'message' | 'title' | 'variant' | 'closeLabel'> {
  /** Persistent by default. Errors always remain until dismissed. */
  duration?: number | null;
}
export interface ToastContextValue {
  notify: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}
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
  const { duration, ...toastProps } = entry.options;
  const remaining = useRef(entry.options.variant !== 'error' && typeof duration === 'number' && Number.isFinite(duration) && duration > 0 ? duration : null);
  const paused = inactive || hovered || focused;
  useEffect(() => {
    if (paused || remaining.current === null) return;
    const started = Date.now();
    const timer = setTimeout(() => close(entry.id, 'timeout'), remaining.current);
    return () => { clearTimeout(timer); remaining.current = Math.max(0, remaining.current! - (Date.now() - started)); };
  }, [close, entry.id, paused]);
  return <Toast {...toastProps} ref={node => register(entry.id, node)} closeLabel={entry.options.closeLabel ?? closeLabel}
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
  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);
  return <Context.Provider value={value}>{children}
    {/* Mounted before any receipt. Additions announce complete messages; removing a
        toast also removes its hidden text, without keeping a second history. */}
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="false" aria-relevant="additions">{entries.filter(entry => entry.options.variant !== 'error').map(entry => <div key={entry.id}>{entry.options.title ? `${entry.options.title} ` : ''}{entry.options.message}</div>)}</div>
    <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="false" aria-relevant="additions">{entries.filter(entry => entry.options.variant === 'error').map(entry => <div key={entry.id}>{entry.options.title ? `${entry.options.title} ` : ''}{entry.options.message}</div>)}</div>
    <ToastAnnouncementContext.Provider value={false}>{entries.length > 0 && <section aria-label={regionLabel} className="fixed inset-x-4 bottom-4 z-50 max-h-[80vh] overflow-y-auto sm:left-auto sm:w-96"><ol className="space-y-3">{entries.map(entry => <li key={entry.id}><TimedToast entry={entry} inactive={!windowActive || !visible} closeLabel={closeLabel} close={close} register={register} /></li>)}</ol></section>}</ToastAnnouncementContext.Provider></Context.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(Context);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
