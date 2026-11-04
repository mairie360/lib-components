# RGAA component markers (MAIR-318)

Every exported component puts `data-m360-component` on its root DOM element. The RGAA engine of
`mairie360/CICD` (`tests/a11y/`) reads it on each captured state of a front, and reports the
`@mairie360/lib-components` components the front imports that no state shows: a modal never
opened or a variant never displayed does not escape the accessibility checks silently.

## The value

The exported names of the components that render the element, outermost first, separated by
spaces. Match one name with `[data-m360-component~="Modal"]`.

| Rendered | Root element |
| --- | --- |
| `<Button />` | `data-m360-component="Button"` |
| `<SaveButton />` | `data-m360-component="SaveButton Button"` |
| `<ConfirmModal />` | `data-m360-component="ConfirmModal Modal"` |
| `<EmailField />` | `data-m360-component="EmailField TextField Field"` |

Names are the exported names and stay stable across versions. Components without a single root
put it on each element they render at the top: `ToastProvider` on its live regions and toast
list, the parts of `Select` and `DropdownMenu` (`SelectTrigger`, `DropdownMenuContent`, ...) on
their own element. `SelectScrollUpButton`, `SelectScrollDownButton` and `DropdownMenuPortal`
render no element of their own.

## In the code

`src/components/component-marker.ts`:

- `componentMarker(name, props)` returns the attribute, merged with the marker a caller passed in
  `props`. Spread it on the root element after `{...props}`, or pass it to the inner component
  (`<Modal {...props} {...componentMarker('ConfirmModal', props)}>`).
- `withoutMarker(props)` drops the caller's marker, for a component that spreads its props on an
  inner control (`<input {...withoutMarker(props)} />` in `TextField`).

`src/__tests__/ComponentMarkers.test.tsx` renders every exported component and fails when one
has no marker, or when a new export has no fixture there.
