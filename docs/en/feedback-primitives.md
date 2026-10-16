# Loading, empty results and notifications

These primitives use the existing municipal theme variables. Import the library stylesheet and supply contextual, localized text. They never send requests or infer successful outcomes.

## Skeleton

`<Skeleton className="h-20" />` is decorative and hidden from assistive technology. Supply a single label for a loading group: `<Skeleton label="Loading records" />`. Avoid announcing every placeholder row. Pulsing respects reduced motion; `animated={false}` disables it for everyone. Keep existing content and errors available while loading.

## EmptyState

```tsx
<EmptyState
  title="No records"
  description="Create your first record to get started."
  icon={<FolderIcon />}
  action={<button onClick={openCreateDialog}>Create a record</button>}
/>
```

The supplied title names a section and renders as a level-three heading. Icons are decorative and actions are application-owned controls. Mounting never moves focus or triggers an action. Distinguish empty results from loading and network errors.

## Toast and ToastProvider

```tsx
<ToastProvider regionLabel="Notifications" closeLabel="Dismiss notification">
  <Application />
</ToastProvider>

function SaveButton() {
  const { notify } = useToast();
  const save = async () => {
    try {
      await saveAndValidateReceipt();
      notify({ variant: 'success', message: 'Record saved.' });
    } catch {
      notify({ variant: 'error', message: 'Could not save. Try again.' });
    }
  };
  return <button onClick={save}>Save</button>;
}
```

`notify(options)` returns an identifier for `dismiss(id)`. `message` is required; `title`, `variant`, `closeLabel` and `duration` are optional. The default variant is `info`. Ordinary notifications use `status`/`polite`; only errors use `alert`/`assertive`. Arrival never takes focus. Escape dismisses only a notification containing focus. Manual dismissal restores the invoking control only when focus was inside the notification and the control remains connected and available. Programmatic dismissal and expiry never move focus.

Notifications are **persistent by default**. A positive, finite duration in milliseconds can be supplied per notification (`duration`) or on the provider (`defaultDuration`). A notification with `duration: null` overrides the provider duration and remains persistent. Errors always remain persistent. Remaining time pauses on hover, internal focus, window blur and document hiding. Toasts have no animation.

Prefer persistent important feedback. When enabling timeouts, offer an application setting to disable them and allow enough reading time. A toast does not replace a field error or a durable confirmation required for the task.

`Toast` also works as a controlled component: `<Toast message="Server receipt" onClose={dismiss} closeLabel="Dismiss notification" />`. Without `onClose` no close button is rendered. The default close label is French, “Fermer la notification”; supply `closeLabel` for another language.

The provider mounts two empty announcement regions before the first notification. Additions retain each complete message and title, including identical messages received together; visual cards remain navigable without a second live announcement. Hidden text is removed with its notification, so there is no separate growing history. DOM tests verify this structure; they do not replace screen-reader validation.

Structural reference: [W3C ARIA22 technique and test procedure](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22#tests).
