'use client';

import React, { useId } from 'react';
import { Clock } from 'lucide-react';

import { Button } from './Button';
import { Icon } from './Icon';
import { Help, SectionTitle } from './Text';

export interface SessionExpiredNoticeProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /** Sign-in page URL (Login front) with the return path already encoded. */
  loginHref?: string;
  onReconnect?: () => void;
  title?: string;
  description?: React.ReactNode;
  reconnectLabel?: string;
}

/** Full-page notice when the session expired: same words in every front (MAIR-608, Figma `Base/SessionExpiredNotice`). */
export const SessionExpiredNotice = ({ loginHref, onReconnect, title = 'Votre session a expiré', description = 'Pour des raisons de sécurité, vous avez été déconnecté après une période d’inactivité. Reconnectez-vous pour continuer.', reconnectLabel = 'Se reconnecter', className = '', style, ...props }: SessionExpiredNoticeProps) => {
  const titleId = useId();
  return (
    <section {...props} role="alert" aria-labelledby={titleId} className={`mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] text-center ${className}`.trim()} style={{ padding: 'var(--mairie-space-xl)', borderRadius: 'var(--mairie-radius-l)', ...style }}>
      <span className="text-[var(--mairie-warning-text)]"><Icon icon={Clock} size="xl" /></span>
      <SectionTitle id={titleId}>{title}</SectionTitle>
      <Help>{description}</Help>
      {loginHref ? <a href={loginHref} className="mt-2 inline-flex items-center justify-center rounded-md bg-[var(--mairie-action-background)] px-4 font-semibold text-[var(--mairie-on-action)] hover:bg-[var(--mairie-action-hover-background)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]" style={{ height: 'var(--mairie-control-m)', fontSize: 'var(--mairie-text-m)' }}>{reconnectLabel}</a>
        : onReconnect ? <Button className="mt-2" label={reconnectLabel} onClick={onReconnect} /> : null}
    </section>
  );
};
