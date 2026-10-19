export type SessionFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

/** The cookie-scoped refresh route is same-origin; a retry never exposes credentials. */
export function createSessionFetch(fetcher: typeof fetch = (...args) => fetch(...args)): SessionFetch {
  let flight: Promise<Response> | undefined;
  let revision = 0;
  return async (input, init) => {
    const startedAtRevision = revision;
    const replay = input instanceof Request ? new Request(input, init) : undefined;
    const signal = init?.signal ?? replay?.signal;
    const response = await fetcher(replay ? replay.clone() : input, replay ? undefined : init);
    if (response.type === 'opaqueredirect' || response.status !== 401 || signal?.aborted || response.headers.get('X-Mairie360-Refresh-Refused') === 'true') {
      if (replay && !replay.bodyUsed) void replay.body?.cancel().catch(() => undefined);
      return response;
    }
    await response.body?.cancel();
    // A previous request may report its 401 after another request already renewed.
    // Its replay uses the current cookies rather than rotating the new token again.
    if (revision !== startedAtRevision) return fetcher(replay ?? input, replay ? undefined : init);
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
    const refreshed = await flight;
    if (signal?.aborted || !refreshed.ok) {
      if (replay && !replay.bodyUsed) void replay.body?.cancel().catch(() => undefined);
      signal?.throwIfAborted();
      return refreshed.clone();
    }
    return fetcher(replay ?? input, replay ? undefined : init);
  };
}
export const sessionFetch: SessionFetch = createSessionFetch();
