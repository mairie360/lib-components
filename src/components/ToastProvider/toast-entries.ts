import { toastTone } from '../Toast';
import type { ToastOptions } from './ToastProvider';

export interface Entry { id: string; options: ToastOptions; trigger: HTMLElement | null }
export type CloseReason = 'manual' | 'programmatic' | 'timeout';
export const isDanger = (options: Pick<ToastOptions, 'tone' | 'variant'>) => toastTone(options.tone, options.variant) === 'danger';
