/**
 * RGAA coverage marker (MAIR-318). Every exported component puts `data-m360-component` on its root
 * DOM element (and on the root of what it portals), so the RGAA engine of mairie360/CICD can tell
 * which lib components a captured page shows and report those a front uses but no state displays.
 *
 * The value lists the components that render that element, outermost first, separated by spaces
 * (`ConfirmModal Modal`, `SaveButton Button`): a component that renders another one passes its
 * marker down as a prop, and the inner one adds its own name. Match one name with
 * `[data-m360-component~="Modal"]`. Names are the exported names, stable across versions.
 */
export const COMPONENT_MARKER = 'data-m360-component';

type Marked = { [COMPONENT_MARKER]?: unknown };

/** The marker of the element rendered by `name`, merged with the one its caller passed in `props`. */
export function componentMarker(name: string, props?: object): { 'data-m360-component': string } {
  const outer = (props as Marked | undefined)?.[COMPONENT_MARKER];
  const names = typeof outer === 'string' ? outer.split(/\s+/).filter(Boolean) : [];
  if (!names.includes(name)) names.push(name);
  return { [COMPONENT_MARKER]: names.join(' ') };
}

/** `props` without the caller's marker, for a component that spreads its props on an inner element. */
export function withoutMarker<T extends object>(props: T): T {
  if (!(COMPONENT_MARKER in props)) return props;
  const rest = { ...props } as T & Marked;
  delete rest[COMPONENT_MARKER];
  return rest;
}
