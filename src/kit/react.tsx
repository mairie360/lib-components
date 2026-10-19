'use client';
import { createContext, useContext, useEffect, useState, type ReactNode, type RefObject } from 'react';
import { configureAppearanceCookieDomain, startAppearanceSync, type Appearance } from './theme';
import { setInstanceTimeZone, type DisplayRole } from './shared';

const InstanceContext = createContext<{role:DisplayRole;timeZone:string}>({role:'Guest',timeZone:'UTC'});
export function InstanceProvider({role,timeZone,children,appearance,appearanceCookieDomain}:{role:DisplayRole;timeZone:string;children:ReactNode;appearance?:Appearance;appearanceCookieDomain?:string}) {
  useEffect(() => {
    configureAppearanceCookieDomain(appearanceCookieDomain);
    return startAppearanceSync({ appearance });
  }, [appearance, appearanceCookieDomain]);
  if (typeof window !== 'undefined') setInstanceTimeZone(timeZone);
  return <InstanceContext.Provider value={{role,timeZone}}>{children}</InstanceContext.Provider>;
}
export function useInstanceRole() { return useContext(InstanceContext).role; }
export function useInstanceTimeZone() { return useContext(InstanceContext).timeZone; }

const modalSelector = '[role="dialog"][aria-modal="true"]';
const tabSelector = 'button, a[href], input:not([type="hidden"]), select, textarea, [tabindex]';
function modalVisible(node: HTMLElement) {
  if (node.closest('[hidden], [aria-hidden="true"], [inert]')) return false;
  const view = node.ownerDocument.defaultView;
  const visibility = view?.getComputedStyle(node).visibility;
  if (visibility === 'hidden' || visibility === 'collapse') return false;
  for (let ancestor: HTMLElement | null = node; ancestor; ancestor = ancestor.parentElement) {
    if (view?.getComputedStyle(ancestor).display === 'none') return false;
  }
  return true;
}
function modalTabStops(dialog: HTMLElement) {
  return [...dialog.querySelectorAll<HTMLElement>(tabSelector)]
    .filter(node => node.tabIndex >= 0 && !node.matches(':disabled') && modalVisible(node));
}

/** One frame-local observer supplies modal focus ownership and navigation inactivity. */
export function useModalFocusScope(frame: RefObject<HTMLElement | null>) {
  const [modalActive, setModalActive] = useState(false);
  useEffect(() => {
    const container = frame.current;
    if (!container) return;
    const document = container.ownerDocument;
    let dialog: HTMLElement | undefined;
    let opener: HTMLElement | null = null;
    let lastFocus = document.activeElement as HTMLElement | null;
    let outsideFocus = lastFocus?.closest(modalSelector) ? null : lastFocus;
    let ownsFocus = false;
    let disposed = false;
    const returnTargets = new WeakMap<HTMLElement, HTMLElement>();
    const focus = (target: HTMLElement) => target.focus({ preventScroll: true });
    const receiveFocus = () => {
      const target = document.activeElement as HTMLElement | null;
      const scope = target?.closest<HTMLElement>(modalSelector);
      if (scope && container.contains(scope)) {
        if (lastFocus?.isConnected && !scope.contains(lastFocus)) returnTargets.set(scope, lastFocus);
        ownsFocus = true;
      } else if (target !== document.body) {
        ownsFocus = false;
        outsideFocus = target;
      }
      // Disabled controls can blur to body without transferring ownership elsewhere.
      lastFocus = target;
    };
    const restore = () => {
      const active = document.activeElement;
      if (ownsFocus && opener?.isConnected && (active === document.body || dialog?.contains(active))) focus(opener);
    };
    const updateDialog = () => {
      if (disposed) return;
      const next = [...container.querySelectorAll<HTMLElement>(modalSelector)]
        .filter(modalVisible).at(-1);
      setModalActive(Boolean(next));
      if (next === dialog) return;
      if (!next) {
        restore(); dialog = undefined; opener = null; ownsFocus = false;
        return;
      }
      const previous = dialog;
      const active = document.activeElement as HTMLElement | null;
      const shouldFocus = !previous || ownsFocus;
      if (!previous) opener = returnTargets.get(next) ?? (next.contains(active) ? outsideFocus : active);
      else if (active && previous.contains(active) && !next.contains(active)) returnTargets.set(next, active);
      dialog = next;
      if (next.contains(active)) { ownsFocus = true; return; }
      if (!shouldFocus) return;
      const returning = previous && returnTargets.get(previous);
      if (returning?.isConnected && next.contains(returning)) focus(returning);
      else { next.tabIndex = -1; focus(modalTabStops(next)[0] ?? next); }
    };
    const trapTab = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== 'Tab' || !dialog) return;
      const lostToBody = ownsFocus && document.activeElement === document.body;
      if (!dialog.contains(event.target as Node) && !lostToBody) return;
      const stops = modalTabStops(dialog), first = stops[0], last = stops.at(-1);
      const outsideStops = !stops.includes(document.activeElement as HTMLElement);
      if (!first || lostToBody || outsideStops || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
        event.preventDefault(); focus((event.shiftKey ? last : first) ?? dialog);
      }
    };
    document.addEventListener('focusin', receiveFocus);
    document.addEventListener('keydown', trapTab);
    updateDialog();
    const observer = new MutationObserver(updateDialog);
    observer.observe(container, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['role', 'aria-modal', 'aria-hidden', 'hidden', 'inert', 'class', 'style'],
    });
    return () => {
      disposed = true; observer.disconnect();
      document.removeEventListener('focusin', receiveFocus);
      document.removeEventListener('keydown', trapTab);
      restore();
    };
  }, [frame]);
  return modalActive;
}
