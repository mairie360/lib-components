'use client';

import React from 'react';

// The published `shared` entry holds the instance time zone set by the front's InstanceProvider.
import { getInstanceTimeZone } from '@mairie360/lib-components/shared';

const emptyOnServer = () => '';

/**
 * Lets React re-read the date once a minute, so a page left open past midnight
 * in the instance time zone shows the new day; React only re-renders when the
 * formatted snapshot actually changes (review of MAIR-578).
 */
const subscribe = (notify: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const timer = setInterval(notify, 60_000);
  return () => clearInterval(timer);
};

export interface CurrentDateProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Instant to display; the current date when omitted. */
  date?: Date;
}

/** Today's date in French, in the instance time zone, as the page title rows display it ("Mardi 20 octobre 2026"). */
export function formatCurrentDate(date = new Date(), timeZone = getInstanceTimeZone()) {
  const label = new Intl.DateTimeFormat('fr-FR', { timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  return label.charAt(0).toLocaleUpperCase('fr') + label.slice(1);
}

/** Rendered empty on the server and filled on the client, so the label always uses the browser's current instant. */
export const CurrentDate = ({ date, className = '', ...props }: CurrentDateProps) => {
  const label = React.useSyncExternalStore(subscribe, () => formatCurrentDate(date), emptyOnServer);
  return (
    <span {...props} className={`page-current-date ${className}`.trim()}>
      {label}
    </span>
  );
};
