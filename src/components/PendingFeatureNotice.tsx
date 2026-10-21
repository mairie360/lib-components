'use client';

import React, { useId } from 'react';
import { Construction } from 'lucide-react';

import { Icon } from './Icon';
import { Help, PanelTitle } from './Text';

export interface PendingFeatureNoticeProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /** Name of the feature, e.g. « Pièces jointes ». */
  feature?: string;
  title?: string;
  description?: React.ReactNode;
}

/** Placeholder of a feature the backend does not serve yet (HTTP 501), same wording in every front (MAIR-608, Figma `Base/PendingFeatureNotice`). */
export const PendingFeatureNotice = ({ feature, title, description = 'Cette fonctionnalité sera disponible dans une prochaine version.', className = '', style, ...props }: PendingFeatureNoticeProps) => {
  const titleId = useId();
  return (
    <section {...props} aria-labelledby={titleId} data-feature={feature} className={`flex flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--mairie-control-border)] bg-[var(--mairie-surface-raised)] text-center ${className}`.trim()} style={{ padding: 'var(--mairie-space-l)', borderRadius: 'var(--mairie-radius-l)', ...style }}>
      <span className="text-[var(--mairie-muted)]"><Icon icon={Construction} size="l" /></span>
      <PanelTitle id={titleId}>{title ?? (feature ? `${feature} : bientôt disponible` : 'Bientôt disponible')}</PanelTitle>
      <Help>{description}</Help>
    </section>
  );
};
