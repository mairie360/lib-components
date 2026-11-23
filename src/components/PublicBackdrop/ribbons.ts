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
  /** Length of one wave cycle, in seconds (10 to 20 s). */
  duration: number;
  /** Alternate direction of the wave. */
  reverse: boolean;
}

/** The four ribbons of the public pages (Figma Login, « Rubans fluides »). */
export const ribbons: readonly Ribbon[] = [
  { token: '--mairie-action-background', opacity: 0.17, start: 760, rise: 640, thickness: 170, amplitude: 60, duration: 14, reverse: false },
  { token: '--mairie-secondary', opacity: 0.07, start: 980, rise: 620, thickness: 120, amplitude: 48, duration: 18, reverse: true },
  { token: '--mairie-action-background', opacity: 0.24, start: 560, rise: 700, thickness: 90, amplitude: 44, duration: 11, reverse: true },
  { token: '--mairie-accent', opacity: 0.17, start: 1120, rise: 560, thickness: 70, amplitude: 70, duration: 20, reverse: false },
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
