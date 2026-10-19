# Frontend extension points while backend work is pending

The 11 October 2026 request authorizes preparing the remaining local-demo features on the frontend before the backend is implemented. Published SDKs, BFF/API sources, environment variables and RGAA configuration remain unchanged. These view ports are frontend interfaces, not new HTTP contracts. They have no production transport until a published operation is mapped to them.

## Expected integration

Map received identities, permissions and records from the future published SDK to these ports. Reject refused, empty, incomplete or mismatched receipts; never resolve a mutation until its server confirmation is verified. Keep requests scoped to the authenticated account. Do not insert simulator fixtures or a fallback HTTP endpoint into production.

Without a bridge, account changes, written reviews and secure downloads report unavailability and preserve the relevant draft. No simulated server success, account protection, current agent, deployed version, notification badge or persistence is manufactured. Passwords, one-time codes, recovery codes and photo previews stay in memory; leaving Security clears its secrets. Notification reads do not acknowledge anything automatically.

## Verification scope

Unit/component tests inject view ports solely to exercise the frontend confirmation/refusal/late-response behavior. Those tests do not certify a backend implementation, deployed authentication, roles, persistence or rollout. Existing business operations continue using their published SDKs.

`AppShell.notificationsSource` controls the notification drawer; its default is an honest unavailable state. `NotificationCenter` accepts actual received items and exact explicit read receipts. The catalog adds written-review rendering, controlled download and eligibility callbacks. Messaging adds controlled attachment download; EventDetailsModal adds a content slot without changing the event record. These optional props preserve existing consumer callbacks.
