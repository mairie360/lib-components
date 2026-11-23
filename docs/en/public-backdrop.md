# PublicBackdrop: background of the public pages (MAIR-1103)

`PublicBackdrop` draws four wide flat ribbons that cross the page diagonally and wave slowly (one wave every 10 to 20 s, alternating directions). It is the Figma component `Fond/Rubans` of the Login file.

```tsx
import { PublicBackdrop } from '@mairie360/lib-components/shell';

<body>
  <PublicBackdrop />
  <div style={{ position: 'relative', zIndex: 1 }}>{/* main, Footer */}</div>
</body>
```

- Colours come from the theme tokens of the page, never from the component: `--mairie-action-background` at 17 % and 24 %, `--mairie-secondary` at 7 %, `--mairie-accent` at 17 %, on `--mairie-background`. No gradient.
- Decorative: `aria-hidden`, `pointer-events: none`, `position: fixed` under the content. Keep the content on an opaque surface (`Card`) so its contrast does not change.
- Motion: at most 60 images per second, stopped while the tab is hidden, a still image with `prefers-reduced-motion` (or `animated={false}`). `variant="none"` draws nothing.

**Charte:** decorative animations in a loop stay forbidden in the application. The public pages (sign-in, password recovery and reset, session expired) are the one exception, and only through this component.
