# Explicit acknowledgement of visible messages — MAIR-269

`Messaging.onReadVisibleMessages(conversation, lastVisibleMessage)` adds a command
to the existing thread actions menu. Consumers opt in; the component sends no
network request and never changes an unread counter itself.

After the menu closes, the component checks the message region, viewport and
clipping ancestors in the next animation frame. It reports the last displayed
bubble intersecting that visible region, or `null` when the document/thread is
hidden or no message is visible. A selection change or unmount invalidates a
scheduled command. A pending callback cannot be started again.

The callback may return `void`, a boolean, or a promise of either. A rejection or
`false` exposes a controlled refusal for that conversation. The consumer owns
the real contract request, permission handling, server confirmation and fresh
authoritative counts. It must reject missing/foreign message IDs and never
acknowledge on bootstrap, polling or an invisible thread.

`MessagingReadAcknowledgement.test.tsx` checks actual component actions with
controlled geometry, including clipping, hidden state, pending commands and
selection changes. These tests do not prove browser layout, deployed API
membership checks or durable persistence. Native consumer verification and an
actually published package remain separate delivery requirements.
