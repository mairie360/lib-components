/**
 * Geometry of the ribbons of `PublicBackdrop` (MAIR-1103), as agreed on the Login simulation: each ribbon goes from
 * `from` (share of the page height on the left edge) to `to` (right edge), `thickness` and `wave` are shares of the
 * height, `wavelength` a share of the width, `speed` the waves per second (the sign alternates the direction: one
 * cycle takes 10 to 20 s) and `phase` shifts the ribbons from one another. `token` and `opacity` are its flat colour.
 */
export interface Ribbon {
  from: number;
  to: number;
  thickness: number;
  wave: number;
  wavelength: number;
  speed: number;
  phase: number;
  token: string;
  opacity: number;
}

export interface RibbonPaint extends Ribbon {
  /** The value of `token` on the page. */
  colour: string;
}

export const RIBBONS: readonly Ribbon[] = [
  { from: 0.05, to: -0.15, thickness: 0.3, wave: 0.07, wavelength: 1.1, speed: 0.07, phase: 0.3, token: '--mairie-action-background', opacity: 0.17 },
  { from: 0.55, to: 0.1, thickness: 0.22, wave: 0.09, wavelength: 0.9, speed: -0.09, phase: 1.9, token: '--mairie-secondary', opacity: 0.07 },
  { from: 0.95, to: 0.45, thickness: 0.26, wave: 0.08, wavelength: 1.3, speed: 0.08, phase: 3.6, token: '--mairie-action-background', opacity: 0.24 },
  { from: 1.25, to: 0.8, thickness: 0.3, wave: 0.06, wavelength: 1, speed: -0.06, phase: 5, token: '--mairie-accent', opacity: 0.17 },
];

/** Horizontal step of the outline, in CSS pixels. */
const STEP = 16;
const TURN = Math.PI * 2;

/** Ordinate of the upper (`side = -1`) or lower (`side = 1`) edge of a ribbon at abscissa `x`, at time `t` (s). */
export function ribbonEdge(ribbon: Ribbon, x: number, t: number, side: -1 | 1, width: number, height: number) {
  const u = width > 0 ? x / width : 0;
  const k = TURN / ribbon.wavelength;
  const centre = height * (ribbon.from + (ribbon.to - ribbon.from) * u) + height * ribbon.wave * Math.sin(u * k + t * ribbon.speed * TURN + ribbon.phase);
  const thickness = height * ribbon.thickness * (0.75 + 0.25 * Math.sin(u * k * 0.7 - t * ribbon.speed * TURN * 0.7 + ribbon.phase * 1.3));
  return centre + (side * thickness) / 2;
}

/** Draws every ribbon at time `t` (seconds) on a `width` × `height` canvas (CSS pixels). */
export function drawRibbons(context: CanvasRenderingContext2D, ribbons: readonly RibbonPaint[], width: number, height: number, t: number) {
  context.clearRect(0, 0, width, height);
  for (const ribbon of ribbons) {
    if (!ribbon.colour) continue;
    context.globalAlpha = ribbon.opacity;
    context.fillStyle = ribbon.colour;
    context.beginPath();
    for (let x = -STEP; x <= width + STEP; x += STEP) context.lineTo(x, ribbonEdge(ribbon, x, t, -1, width, height));
    for (let x = width + STEP; x >= -STEP; x -= STEP) context.lineTo(x, ribbonEdge(ribbon, x, t, 1, width, height));
    context.closePath();
    context.fill();
  }
  context.globalAlpha = 1;
}
