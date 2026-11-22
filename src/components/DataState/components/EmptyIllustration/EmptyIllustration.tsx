import React from 'react';

/**
 * MAIR-1098 (Figma `Base/DataState`, empty m / l): the town hall with its flag, an envelope flying to the
 * tray and a few sparkles, drawn with the theme tokens (classes of municipal-theme.css). Decorative; the
 * flag, the trail, the envelope and the sparkles move only for users allowing motion.
 */
export function EmptyIllustration({ size }: { size: 'm' | 'l' }) {
  const width = size === 'l' ? 176 : 132;
  return (
    <svg aria-hidden="true" focusable="false" data-illustration="empty" viewBox="0 0 160 120" width={width} height={width * 0.75} className="block max-w-full">
      <ellipse className="mairie-ill-soft" cx="80" cy="109" rx="66" ry="7" />
      <rect className="mairie-ill-soft" x="22" y="52" width="62" height="52" rx="2" />
      <path className="mairie-ill-stroke" d="M17 52 53 31l36 21z" />
      <rect className="mairie-ill-stroke" x="22" y="52" width="62" height="52" rx="2" />
      <path className="mairie-ill-stroke" d="M34 64v30M46 64v30M60 64v30M72 64v30M16 104h74" />
      <circle className="mairie-ill-stroke" cx="53" cy="44" r="4" />
      <path className="mairie-ill-stroke" d="M53 31V14" />
      <path className="mairie-ill-flag" d="M53 14h16l-4 4.5 4 4.5H53z" />
      <path className="mairie-ill-tray" d="M97 86h46l-5 18h-36z" />
      <path className="mairie-ill-stroke" d="M92 86h56M97 86l5 18h36l5-18" />
      <path className="mairie-ill-stroke mairie-ill-faint" d="M109 95h22" />
      <path className="mairie-ill-trail" d="M120 80c-9-12 14-20 4-34" />
      <g className="mairie-ill-float">
        <rect className="mairie-ill-envelope" x="111" y="18" width="28" height="19" rx="3" />
        <path className="mairie-ill-envelope-line" d="M112 20l14 10 14-10" />
      </g>
      <path className="mairie-ill-spark" d="M98 28l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
      <path className="mairie-ill-spark mairie-ill-delay-1" d="M148 56l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" />
      <circle className="mairie-ill-spark-accent mairie-ill-delay-2" cx="20" cy="30" r="2.5" />
      <circle className="mairie-ill-spark-accent" cx="148" cy="22" r="2" />
    </svg>
  );
}
