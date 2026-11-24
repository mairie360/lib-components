export type SessionFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

/**
 * Waits before each replay of a request superseded by another tab's renewal. That renewal's cookies reach this tab
 * when its response arrives, which this tab cannot observe: the cookies are HttpOnly and the fronts are different
 * origins (no shared channel). The request is replayed after each wait while the answer is still superseded, then the
 * last answer is returned (about 3 s in all), so a slow renewal is waited for and a dead one does not hold the page.
 */
const SUPERSEDED_REPLAY_DELAYS_MS = [300, 900, 2000];
const settle = (delay: number, signal?: AbortSignal | null) => new Promise<void>(resolve => {
  const timer = setTimeout(resolve, delay);
  signal?.addEventListener('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
});
const isSuperseded = (response: Response) => response.status === 401 && response.headers.get('X-Mairie360-Refresh-Superseded') === 'true';

/** The cookie-scoped refresh route is same-origin; a retry never exposes credentials. */
export function createSessionFetch(fetcher: typeof fetch = (...args) => fetch(...args)): SessionFetch {
  let flight: Promise<Response> | undefined;
  let revision = 0;
  const renew = (): Promise<Response> => {
    if (!flight) {
      const renewal = fetcher('/api/auth/refresh', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'manual',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: '{}',
      }).then(async result => {
        if (!result.ok) return result;
        const body: unknown = await result.clone().json().catch(() => null);
        if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string' && body.message.trim()) {
          revision++;
          return result;
        }
        return Response.json({ message: 'La réponse de renouvellement est invalide.' }, { status:502 });
      }).catch(() => Response.json({message:'La session est temporairement indisponible.'},{status:503}));
      flight = renewal;
      void renewal.finally(() => { if (flight === renewal) flight = undefined; });
    }
    return flight;
  };
  return async (input, init) => {
    const startedAtRevision = revision;
    const replay = input instanceof Request ? new Request(input, init) : undefined;
    const signal = init?.signal ?? replay?.signal;
    const send = () => fetcher(replay ? replay.clone() : input, replay ? undefined : init);
    const release = () => { if (replay && !replay.bodyUsed) void replay.body?.cancel().catch(() => undefined); };
    // Another tab renewed the session while this one tried to: replay with the cookies that renewal set, without
    // rotating again (the refresh token this tab sent is the one that renewal replaced).
    const awaitOtherRenewal = async (last: Response): Promise<Response> => {
      let response = last;
      /* eslint-disable no-await-in-loop -- each replay depends on the previous answer: sequential on purpose */
      for (const delay of SUPERSEDED_REPLAY_DELAYS_MS) {
        await settle(delay, signal);
        signal?.throwIfAborted();
        response = await send();
        if (response.status === 401 && !isSuperseded(response) && response.headers.get('X-Mairie360-Refresh-Refused') !== 'true') {
          // A route whose proxy cannot renew answers a plain 401: renew through the own API route, which now carries
          // the other renewal's cookie once it has landed.
          await response.body?.cancel();
          const renewed = await renew();
          if (renewed.ok) return send();
          if (renewed.status !== 409) return renewed.clone();
          response = Response.json({ message: 'La session vient d’être renouvelée par un autre onglet.' }, { status: 401, headers: { 'X-Mairie360-Refresh-Superseded': 'true' } });
          continue;
        }
        if (!isSuperseded(response)) return response;
        if (delay !== SUPERSEDED_REPLAY_DELAYS_MS.at(-1)) await response.body?.cancel();
      }
      /* eslint-enable no-await-in-loop */
      return response;
    };
    const response = await send();
    if (response.type === 'opaqueredirect' || response.status !== 401 || signal?.aborted || response.headers.get('X-Mairie360-Refresh-Refused') === 'true') {
      release();
      return response;
    }
    if (isSuperseded(response)) {
      await response.body?.cancel();
      return awaitOtherRenewal(response);
    }
    await response.body?.cancel();
    // A previous request may report its 401 after another request already renewed.
    // Its replay uses the current cookies rather than rotating the new token again.
    if (revision !== startedAtRevision) return fetcher(replay ?? input, replay ? undefined : init);
    const refreshed = await renew();
    if (refreshed.status === 409 && !signal?.aborted) return awaitOtherRenewal(refreshed.clone());
    if (signal?.aborted || !refreshed.ok) {
      release();
      signal?.throwIfAborted();
      return refreshed.clone();
    }
    return fetcher(replay ?? input, replay ? undefined : init);
  };
}
export const sessionFetch: SessionFetch = createSessionFetch();
