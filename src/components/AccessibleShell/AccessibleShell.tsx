'use client';

import React from 'react';

import { AppShell, type AppShellProps } from '../AppShell';
// The published `react` entry owns the instance context; bundling src/kit/react here would create a second one.
import { useInstanceRole, useModalFocusScope } from '@mairie360/lib-components/react';

export type AccessibleShellProps = Omit<AppShellProps, 'collapsibleSidebar' | 'desktopNavigation' | 'skipLinkInactive' | 'isAdmin' | 'footerPlacement'>;

const alertDialogSelector = '[role="alertdialog"][aria-modal="true"]';

function alertDialogVisible(dialog: HTMLElement, container: HTMLElement) {
  if (dialog.closest('[hidden], [aria-hidden="true"], [inert]')) return false;
  const view = container.ownerDocument.defaultView;
  for (let node: HTMLElement | null = dialog; node; node = node.parentElement) {
    const style = view?.getComputedStyle(node);
    if (style?.display === 'none' || style?.visibility === 'hidden' || style?.visibility === 'collapse') return false;
  }
  return true;
}

/** Observe consumer-owned alert dialogs: their focus trap is theirs, the shell only stays inert meanwhile. */
function useAlertDialogScope(frame: React.RefObject<HTMLDivElement | null>) {
  const [active, setActive] = React.useState(false);
  React.useEffect(() => {
    const container = frame.current;
    if (!container || typeof MutationObserver === 'undefined') return;
    const update = () => setActive([...container.querySelectorAll<HTMLElement>(alertDialogSelector)].some((dialog) => alertDialogVisible(dialog, container)));
    update();
    const observer = new MutationObserver(update);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['role', 'aria-modal', 'aria-hidden', 'hidden', 'inert', 'class', 'style'],
    });
    return () => observer.disconnect();
  }, [frame]);
  return active;
}

/**
 * The shared application shell as every front consumes it: the collapsible
 * desktop navigation, the administration entry driven by the trusted instance
 * role, the content footer, and a shell kept inert (skip link included) while a
 * dialog or alert dialog opened inside the frame owns the focus.
 */
export const AccessibleShell = ({ children, footerProps, sidebarProps, className = '', ...props }: AccessibleShellProps) => {
  const role = useInstanceRole();
  const frame = React.useRef<HTMLDivElement>(null);
  const modalActive = useModalFocusScope(frame);
  const alertDialogActive = useAlertDialogScope(frame);
  const navigationInactive = modalActive || alertDialogActive;
  return (
    <div ref={frame} className="app-shell-root" data-navigation-inactive={navigationInactive || undefined}>
      <AppShell
        {...props}
        className={className}
        collapsibleSidebar
        isAdmin={role === 'Admin'}
        skipLinkInactive={navigationInactive}
        sidebarProps={sidebarProps}
        footerPlacement="content"
        footerProps={footerProps}
      >
        <div className="app-main-content">{children}</div>
      </AppShell>
    </div>
  );
};
