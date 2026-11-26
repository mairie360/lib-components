import { useEffect, useState } from 'react';

/**
 * Text of a live region, given only once the region is mounted. A `role="status"` region inserted together
 * with its message is not announced by screen readers (RGAA 7.5): the region is rendered empty first,
 * then the message is written into it, so it is read.
 */
export function useMountedAnnouncement(message: string | undefined): string {
  const [mounted, setMounted] = useState(false);
  // One more render after the mount is the point: the region must exist before its message, also when it is
  // mounted on the client after a fetch, which a server snapshot (`useSyncExternalStore`) would not give.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);
  return mounted ? message ?? '' : '';
}
