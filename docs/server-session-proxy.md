# Shared frontend session server

MAIR-266 uses the separate `@mairie360/lib-components/next` entry for Next route handlers. Next is an optional peer; the React UI entry and its styles stay separate. Install the actual published library release before migrating a consumer.

The User protocol comes from the published `a416b4ea37f54566260e7b926b920f31799cb91e` contract, observed in Dev on 10 October 2026. Its `/auth/refresh` accepts `refresh_token` and returns `message` with rotated credentials in HttpOnly cookies. `/auth/logout` accepts the refresh token, reports `session_revoked` and may return the Keycloak end-session URL. The test fixture contains exact selected operations and transitive schemas from that export. The earlier published User0.5 message-only logout remains local expiry with server revocation explicitly unconfirmed.

## Ownership and request flow

Login mounts `createSessionRefreshHandler` and `createSessionLogoutHandler` at `/api/auth/refresh` and `/api/auth/logout`. Configure the existing User BFF URL, the existing shared cookie domain and the eight authorized public frontend origins. These POSTs require JSON, an authorized Origin and same-origin or same-site metadata. They read refresh credentials from HttpOnly cookies. The handlers emit a secure, Strict access cookie on `/`, bounded by JWT/upstream expiry, and a session-only refresh cookie on `/api`.

Each frontend mounts its published-contract proxy under `/api/bff`. Its existing request adapter uses that prefix so the browser sends the `/api` refresh cookie. `proxyPublishedBffRequest` matches declared methods and paths, preserves request bytes/query parameters and removes browser cookies, hop headers and untrusted IP headers before reaching the BFF. A cookie session takes precedence over a browser bearer. A401 delegates renewal to Login, then retries the same operation once. A second401 marks the response for Login navigation; a403 preserves the permission refusal. A business outage after successful rotation still delivers the new cookie pair.

Other fronts mount `createSessionLogoutProxy` for their explicit same-origin logout POST. Login performs User revocation and the owner expires the shared cookie scopes. Clients must keep `session_revoked=false` visible as an unconfirmed server closure. Navigate to a returned `logout_url` only after the validated owner response; the server accepts the published Keycloak end-session path in the configured instance domain and an authorized post-logout origin.

The Login process shares a bounded, token-hashed flight table across route bundles. Concurrent frontend contexts use one User renewal. Old and rotated keys share a short handover, bounded by the actual access expiry; explicit logout invalidates both and prevents an in-flight renewal from completing as success. Expired entries are removed on subsequent renewal. Raw credentials remain in server memory and response cookies; they are never returned in a JSON session body.

## Verification and deployment limits

Tests execute real Next request/response classes, validate fixtures with the selected published schema and exercise eight frontend contexts, concurrency, rotation, cookie attributes, expiry, refusals, one replay, logout and malformed receipts. These are local protocol tests, separate from authenticated Dev acceptance.

The current Dev chart defines one steady Login replica and permits frontend HTTPS egress. A rolling update can temporarily run two Login processes; process memory does not provide distributed coordination during that overlap or horizontal scaling. Those states require separate validation or durable coordination before claiming a cross-process guarantee. Do not change API/BFF sources, their configuration, network protections or RGAA checks to obtain it. Deployed account, persistence, session revocation and Keycloak closure remain separate evidence.
