'use client';

import React from 'react';
import { Copy } from 'lucide-react';

import { InfoAlert } from '../Alert';
import { DescriptionList } from '../DescriptionList';
import { IconButton } from '../IconButton';
import { formatSessionDate, sessionState, sessionStateLabels, sessionStateStatuses, type SessionRecord } from '../SessionList';
import { StatusBadge, StatusPill } from '../StatusPill';
import { componentMarker } from '../component-marker';
import { describeUserAgent } from './user-agent';

export interface SessionDetailsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  session: SessionRecord;
  /** The session of this device: « Cet appareil » badge and « Session en cours » notice. */
  current?: boolean;
  /** Time zone of the dates (the instance time zone by default). */
  timeZone?: string;
  /** Reference time of the state badge (now by default; fixed in tests and stories). */
  now?: number;
}

const unknown = <span className="text-[var(--mairie-muted)]">Non disponible</span>;

/**
 * Detail of one session (MAIR-930, Figma `SessionDetails`): state, « Cet appareil », the readable device
 * (describeUserAgent) and the dates, in a DescriptionList; the identifier can be copied.
 */
export function SessionDetails({ session, current = false, timeZone, now, className = '', ...props }: SessionDetailsProps) {
  const [copied, setCopied] = React.useState(false);
  // The reference time is read once, when the details open (a lazy initialiser, not every render).
  const [openedAt] = React.useState(() => Date.now());
  const state = sessionState(session, now ?? openedAt);
  const device = describeUserAgent(session.device_info);
  const date = (value: string | null | undefined) => formatSessionDate(value, timeZone) ?? unknown;
  const copy = async () => {
    try { await navigator.clipboard.writeText(session.id); setCopied(true); } catch { setCopied(false); }
  };
  return (
    <div {...props} {...componentMarker('SessionDetails', props)} className={`flex flex-col ${className}`.trim()} style={{ gap: 'var(--mairie-space-m)' }}>
      <div className="flex flex-wrap items-center" style={{ gap: 'var(--mairie-space-s)' }}>
        <StatusBadge status={sessionStateStatuses[state]} label={sessionStateLabels[state]} />
        {current ? <StatusPill tone="primary" label="Cet appareil" /> : null}
      </div>
      {current ? <InfoAlert title="Session en cours" description="C’est la session de cet appareil. La déconnecter vous ramène à l’écran de connexion." /> : null}
      <DescriptionList items={[
        { label: 'Navigateur', value: device.browser },
        { label: 'Système', value: device.os },
        { label: 'Type d’appareil', value: device.deviceType },
        { label: 'Adresse IP', value: session.ip_address || unknown },
        { label: 'Localisation', value: session.location || unknown },
        { label: 'Connexion', value: date(session.created_at) },
        { label: 'Dernière activité', value: date(session.last_active_at) },
        { label: state === 'revoked' ? 'Déconnectée le' : state === 'expired' ? 'Expirée le' : 'Expiration', value: date(state === 'revoked' ? session.revoked_at : session.expires_at) },
        {
          label: 'Identifiant',
          value: (
            <span className="inline-flex max-w-full items-center" style={{ gap: 'var(--mairie-space-xs)' }}>
              <code className="min-w-0 break-all font-mono">{session.id}</code>
              <IconButton icon={Copy} label="Copier l’identifiant" size="xs" onClick={() => { void copy(); }} />
              <span role="status" className="sr-only">{copied ? 'Identifiant copié' : ''}</span>
            </span>
          ),
        },
      ]} />
    </div>
  );
}
