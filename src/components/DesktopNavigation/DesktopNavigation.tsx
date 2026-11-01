"use client";

import { defaultSidebarItems } from '../Sidebar';
import { mairie360LogoSrc } from '../../assets/logo';
import type { AppShellProps } from '../AppShell';
import { useEffect, useRef, useState, type FocusEvent } from 'react';

type Props = Pick<AppShellProps, 'activeItem' | 'isAdmin' | 'hrefs' | 'onNavigate' | 'onPageChange' | 'sidebarProps'> & {
  /** Called with `true` while the navigation rests collapsed and `false` while hover or keyboard focus expands it. */
  onCollapsedChange: (value: boolean) => void;
  inactive?: boolean;
};

function safeDestination(value: string | undefined) {
  const href = value?.trim();
  if (!href || href.startsWith('//') || href.includes('\\')) return undefined;
  if (/^https?:\/\//i.test(href)) {
    try { const url = new URL(href); return url.username || url.password ? undefined : href; } catch { return undefined; }
  }
  return /^[a-z][a-z\d+.-]*:/i.test(href) ? undefined : href;
}

/**
 * Desktop navigation of the shared shell (MAIR-548, Figma `DesktopNavigation`).
 * It rests collapsed (logo and module icons) and expands to the width of its
 * commands while the pointer is over it or keyboard focus is inside it (a click
 * focuses a command without keeping the band open once the pointer leaves), pushing
 * the module aside rather than covering it. Mobile navigation stays in AppShell.
 */
export function DesktopNavigation({ activeItem = 'dashboard', isAdmin = false, hrefs, onNavigate, onPageChange, sidebarProps, onCollapsedChange, inactive = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  // Focus that follows a pointer press is not keyboard focus: it must not keep the band expanded.
  const pointerPressed = useRef(false);
  const expanded = !inactive && (hovered || focused);
  const items = (sidebarProps?.items ?? defaultSidebarItems).filter(item => (!item.adminOnly || isAdmin) && (safeDestination(hrefs[item.id]) || onPageChange));

  useEffect(() => { onCollapsedChange(!expanded); }, [expanded, onCollapsedChange]);
  useEffect(() => { setLogoFailed(false); }, [sidebarProps?.brandLogoSrc]);

  const navigate = (item: (typeof items)[number]) => {
    sidebarProps?.onItemSelect?.(item);
    const href = safeDestination(hrefs[item.id]);
    if (href) {
      if (/^https?:\/\//i.test(href)) window.location.assign(href);
      else if (onNavigate) onNavigate(href, item.id);
      else window.location.assign(href);
    } else onPageChange?.(item.id);
  };
  const leaveFocus = (event: FocusEvent<HTMLElement>) => {
    if (!asideRef.current?.contains(event.relatedTarget as Node | null)) setFocused(false);
  };
  const logo = sidebarProps?.brandLogoSrc === undefined ? mairie360LogoSrc : sidebarProps.brandLogoSrc;
  const brandLabel = sidebarProps?.brandLabel?.trim();

  return <aside ref={asideRef} className="app-desktop-navigation" aria-label="Navigation principale" data-expanded={expanded} inert={inactive}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onPointerDownCapture={() => { pointerPressed.current = true; }} onMouseDownCapture={() => { pointerPressed.current = true; }}
    onKeyDownCapture={() => { pointerPressed.current = false; setFocused(true); }}
    onFocus={() => { setFocused(!pointerPressed.current); pointerPressed.current = false; }} onBlur={leaveFocus}>
    <div className="app-navigation-brand">
      {logo && !logoFailed
        ? <img className="app-navigation-logo" src={logo} alt={sidebarProps?.brandLogoAlt ?? 'Logo Mairie360'} onError={() => setLogoFailed(true)} />
        : <span className="app-navigation-initial">{sidebarProps?.brandInitial ?? 'M'}</span>}
      {brandLabel && <span className="app-navigation-commune">
        <span className="app-navigation-commune-caption">Commune de</span>
        <span className="app-navigation-commune-name">{brandLabel}</span>
      </span>}
    </div>
    <nav aria-label="Menu principal">
      {items.map(item => {
        const Icon = item.icon;
        return <button key={item.id} type="button" aria-label={`${item.label}${item.badge ? ` (${item.badge})` : ''}`} aria-current={activeItem === item.id ? 'page' : undefined} data-admin={item.id === 'admin'} onClick={() => navigate(item)}>
          <Icon aria-hidden="true" size={20} />
          <span className="app-navigation-label">{item.label}</span>
          {item.badge && <span className="app-navigation-badge" aria-hidden="true">{item.badge}</span>}
        </button>;
      })}
    </nav>
  </aside>;
}
