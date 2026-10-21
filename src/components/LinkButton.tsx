'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

import type { Size, Tone } from '@mairie360/lib-components/theme';
import { buttonAppearance, buttonBaseClass, buttonSizing } from './Button';
import { Icon } from './Icon';

export interface LinkButtonProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  /** Renders an anchor when given, a button otherwise (same look). */
  href?: string;
  label?: string;
  children?: React.ReactNode;
  tone?: Tone;
  size?: Size;
  /** Leading icon (Content = TextIcon) or the only content when `iconOnly` (Content = Icon, label becomes the accessible name). */
  icon?: LucideIcon;
  iconOnly?: boolean;
  /** Clickable image with its caption (Content = Image). */
  image?: { src: string; alt: string };
  onClick?: React.MouseEventHandler<HTMLElement>;
  disabled?: boolean;
}

/** An action that looks like a link (MAIR-608, Figma `Base/Button/Link`): text, icon + text, icon only or image. */
export const LinkButton = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, LinkButtonProps>(function LinkButton(
  { href, label, children, tone = 'primary', size = 'm', icon, iconOnly = false, image, className = '', style, disabled, onClick, ...props },
  ref,
) {
  const content = children ?? label;
  const appearance = buttonAppearance('link', tone);
  const body = image ? (
    <span className="inline-flex flex-col items-center" style={{ gap: 'var(--mairie-space-xs)' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- consumer-provided illustration */}
      <img src={image.src} alt={image.alt} className="rounded-[var(--mairie-radius-m)] border border-[var(--mairie-border)] object-cover" style={{ height: `calc(var(--mairie-control-${size}) * 2)` }} />
      {content ? <span className="underline underline-offset-4">{content}</span> : null}
    </span>
  ) : (
    <>
      {icon ? <Icon icon={icon} size={size} /> : null}
      {iconOnly ? null : content}
    </>
  );
  const shared = {
    'data-tone': tone,
    'data-size': size,
    'data-content': image ? 'image' : iconOnly ? 'icon' : icon ? 'text-icon' : 'text',
    'aria-label': iconOnly ? label : undefined,
    className: `${buttonBaseClass} ${appearance.className} ${image ? 'no-underline' : ''} !px-0 ${className}`.replace(/\s+/g, ' ').trim(),
    style: { ...buttonSizing(size), ...(image ? { height: 'auto' } : {}), ...appearance.style, ...style },
  };
  if (href && !disabled) {
    return <a {...props} {...shared} ref={ref as React.Ref<HTMLAnchorElement>} href={href} onClick={onClick}>{body}</a>;
  }
  return (
    <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} {...shared} ref={ref as React.Ref<HTMLButtonElement>} type="button" disabled={disabled} onClick={onClick}>
      {body}
    </button>
  );
});
