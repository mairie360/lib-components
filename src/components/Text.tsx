'use client';

import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'default' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'inverse';
export type TextElement = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'label' | 'a' | 'dt' | 'dd' | 'time' | 'strong';

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  /** Rendered element; presets choose a sensible one (h1 for a page title, p for body…). */
  as?: TextElement;
  /** Font size on the shared scale (xs 12 px … xl 20 px). */
  size?: Size;
  weight?: TextWeight;
  tone?: TextTone;
  /** Uppercase letter-spaced text (column headers, overlines). */
  uppercase?: boolean;
  /** Single line with an ellipsis. */
  truncate?: boolean;
  htmlFor?: string;
  href?: string;
  dateTime?: string;
  children?: React.ReactNode;
}

const weights: Record<TextWeight, string> = { regular: 'font-normal', medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold' };
const toneTokens: Record<TextTone, string> = {
  default: 'var(--mairie-text)',
  muted: 'var(--mairie-muted)',
  primary: 'var(--mairie-accent)',
  secondary: 'var(--mairie-secondary)',
  success: 'var(--mairie-success-text)',
  warning: 'var(--mairie-warning-text)',
  danger: 'var(--mairie-error-text)',
  inverse: 'var(--mairie-on-secondary)',
};

/**
 * The only text primitive of the fronts (MAIR-608, Figma `Base/Text`): size on the
 * shared scale, weight and semantic tone bound to the charte tokens. Prefer the
 * presets (`PageTitle`, `Body`, `Help`, `ErrorText`…) and keep this base for a new case.
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(
  { as = 'span', size = 'm', weight = 'regular', tone = 'default', uppercase = false, truncate = false, className = '', style, children, ...props },
  ref,
) {
  const Element = as as React.ElementType;
  return (
    <Element
      {...props}
      ref={ref}
      data-size={size}
      data-tone={tone}
      className={`${weights[weight]} ${uppercase ? 'uppercase tracking-wide' : ''} ${truncate ? 'block truncate' : ''} ${className}`.replace(/\s+/g, ' ').trim()}
      style={{ fontSize: `var(--mairie-text-${size})`, lineHeight: 1.5, color: toneTokens[tone], ...style }}
    >
      {children}
    </Element>
  );
});

export type TextPresetProps = Omit<TextProps, 'size' | 'weight'> & { size?: Size; weight?: TextWeight };

function preset(name: string, defaults: Partial<TextProps>) {
  const Preset = React.forwardRef<HTMLElement, TextPresetProps>(function Preset(props, ref) {
    const overrides = Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) as TextPresetProps;
    // A consumer class adds to the preset classes (a Link keeps its underline).
    const className = [defaults.className, overrides.className].filter(Boolean).join(' ') || undefined;
    return <Text ref={ref} {...defaults} data-preset={name} {...overrides} className={className} />;
  });
  Preset.displayName = name;
  return Preset;
}

/** h1 of a page (Figma Text/PageTitle). */
export const PageTitle = preset('PageTitle', { as: 'h1', size: 'xl', weight: 'bold' });
/** h2 of a section or a panel (Text/SectionTitle). */
export const SectionTitle = preset('SectionTitle', { as: 'h2', size: 'l', weight: 'semibold' });
/** h3 of a card (Text/PanelTitle). */
export const PanelTitle = preset('PanelTitle', { as: 'h3', size: 'm', weight: 'semibold' });
/** Title of a modal or a drawer (Text/ModalTitle). */
export const ModalTitle = preset('ModalTitle', { as: 'h2', size: 'l', weight: 'semibold' });
/** Running text (Text/Body). */
export const Body = preset('Body', { as: 'p', size: 'm' });
/** Secondary text: cells, lists (Text/BodySmall). */
export const BodySmall = preset('BodySmall', { as: 'p', size: 's' });
/** Help under a field, description (Text/Help). */
export const Help = preset('Help', { as: 'p', size: 's', tone: 'muted' });
/** Field error message (Text/Error). */
export const ErrorText = preset('ErrorText', { as: 'p', size: 's', weight: 'medium', tone: 'danger' });
/** Caption, timestamp, counter (Text/Caption). */
export const Caption = preset('Caption', { as: 'span', size: 'xs', tone: 'muted' });
/** Field label (Text/Label). */
export const Label = preset('Label', { as: 'label', size: 's', weight: 'medium' });
/** Column header, uppercase overline (Text/Overline). */
export const Overline = preset('Overline', { as: 'span', size: 'xs', weight: 'semibold', tone: 'muted', uppercase: true });
/** Link inside a text (Text/Link). */
export const Link = preset('Link', { as: 'a', size: 'm', weight: 'medium', tone: 'primary', className: 'underline underline-offset-4 hover:no-underline' });
/** Numeric value of an indicator (Text/Metric). */
export const Metric = preset('Metric', { as: 'span', size: 'xl', weight: 'bold' });

export const TextPresets = { pageTitle: PageTitle, sectionTitle: SectionTitle, panelTitle: PanelTitle, modalTitle: ModalTitle, body: Body, bodySmall: BodySmall, help: Help, error: ErrorText, caption: Caption, label: Label, overline: Overline, link: Link, metric: Metric } as const;
