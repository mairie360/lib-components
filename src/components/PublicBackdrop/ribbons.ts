/** Width and height of the backdrop drawing; the SVG stretches it over the viewport. */
export const BACKDROP_WIDTH = 1440;
export const BACKDROP_HEIGHT = 900;

export interface Ribbon {
  /** Theme token of the flat fill (no gradient). */
  token: '--mairie-action-background' | '--mairie-secondary' | '--mairie-accent';
  /** Fill opacity (MAIR-1103: action 17 % and 24 %, secondary 7 %, accent 17 %). */
  opacity: number;
  /** Vertical position where the ribbon enters on the left edge. */
  start: number;
  /** Height the ribbon climbs while it crosses the page (diagonal). */
  rise: number;
  /** Thickness of the ribbon. */
  thickness: number;
  /** Amplitude of the wave. */
  amplitude: number;
  /** Length of one wave cycle, in seconds (22 to 33 s, as the artifact). */
  duration: number;
  /** Alternate direction of the wave. */
  reverse: boolean;
}

/**
 * The four ribbons of the public pages, top to bottom (MAIR-1260: the « Rubans fluides » of the validated Login
 * artifact, whose bands are action, secondary, action, accent, 170–240 px thick over the whole height and wave in 22–33 s).
 */
export const ribbons: readonly Ribbon[] = [
  { token: '--mairie-action-background', opacity: 0.17, start: -58, rise: 210, thickness: 236, amplitude: 63, duration: 29, reverse: false },
  { token: '--mairie-secondary', opacity: 0.07, start: 443, rise: 473, thickness: 173, amplitude: 81, duration: 22, reverse: true },
  { token: '--mairie-action-background', opacity: 0.24, start: 790, rise: 525, thickness: 205, amplitude: 72, duration: 25, reverse: false },
  { token: '--mairie-accent', opacity: 0.17, start: 1041, rise: 473, thickness: 236, amplitude: 54, duration: 33, reverse: true },
];

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * Path of a ribbon crossing the page diagonally from bottom left to top right, both edges drawn with
 * the same two cubic curves so the shapes of a wave keep the same commands (SMIL interpolates them).
 * `phase` is -1 or 1: the two extreme shapes of the wave.
 */
export function ribbonPath(ribbon: Pick<Ribbon, 'start' | 'rise' | 'thickness' | 'amplitude'>, phase: -1 | 1): string {
  const left = -120;
  const right = BACKDROP_WIDTH + 120;
  const middle = (left + right) / 2;
  const edge = (offset: number, reversed: boolean) => {
    const y = (x: number) => ribbon.start + offset - ((x - left) / (right - left)) * ribbon.rise;
    const wave = ribbon.amplitude * phase;
    const points = [
      [left, y(left)],
      [left + (middle - left) / 3, y(left + (middle - left) / 3) - wave],
      [left + (2 * (middle - left)) / 3, y(left + (2 * (middle - left)) / 3) - wave],
      [middle, y(middle)],
      [middle + (right - middle) / 3, y(middle + (right - middle) / 3) + wave],
      [middle + (2 * (right - middle)) / 3, y(middle + (2 * (right - middle)) / 3) + wave],
      [right, y(right)],
    ].map(([x, value]) => `${round(x)} ${round(value)}`);
    const ordered = reversed ? [...points].reverse() : points;
    return { from: ordered[0], curves: `C ${ordered[1]} ${ordered[2]} ${ordered[3]} C ${ordered[4]} ${ordered[5]} ${ordered[6]}` };
  };
  const top = edge(0, false);
  const bottom = edge(ribbon.thickness, true);
  return `M ${top.from} ${top.curves} L ${bottom.from} ${bottom.curves} Z`;
}
