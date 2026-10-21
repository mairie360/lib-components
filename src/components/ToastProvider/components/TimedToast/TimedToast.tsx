'use client';

import { useEffect, useRef, useState } from 'react';
import { Toast } from '@/components/Toast';
import { isDanger, type CloseReason, type Entry } from '../../toast-entries';

// One notification of the provider: its hover/focus pauses, its countdown and its close reasons.
export function TimedToast({ entry, inactive, closeLabel, close, register }: {
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
