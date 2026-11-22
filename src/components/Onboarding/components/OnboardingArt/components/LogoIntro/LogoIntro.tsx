'use client';

import React from 'react';

import { mairie360LogoSrc } from '../../../../../../assets/logo';

/**
 * MAIR-1097: the 3 s logo intro of the first Onboarding slide, played once (no loop): the stroke is drawn from
 * the centre, « mairie » rises, « 360 » comes down, a light bounce, then one shine. Three clipped copies of
 * the logo (municipal-theme.css, `.mairie-logo-intro-*`); without motion, or with `animate` off, the logo is
 * shown whole. Decorative: the slide title names it.
 */
export function LogoIntro({ animate = true }: { animate?: boolean }) {
  /* eslint-disable @next/next/no-img-element -- the bundled logo is a data URL; no image loader applies. */
  if (!animate) return <span className="mairie-logo-intro block" data-logo-intro="static"><img src={mairie360LogoSrc} alt="" /></span>;
  return (
    <span className="mairie-logo-intro block" data-logo-intro="animated">
      <img className="mairie-logo-intro-top" src={mairie360LogoSrc} alt="" />
      <img className="mairie-logo-intro-bottom" src={mairie360LogoSrc} alt="" />
      <img className="mairie-logo-intro-line" src={mairie360LogoSrc} alt="" />
      <span aria-hidden="true" className="mairie-logo-intro-shine" style={{ maskImage: `url(${mairie360LogoSrc})`, WebkitMaskImage: `url(${mairie360LogoSrc})` }} />
    </span>
  );
  /* eslint-enable @next/next/no-img-element */
}
