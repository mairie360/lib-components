'use client';

import React from 'react';

import { LogoIntro } from './components/LogoIntro';

export type OnboardingArtName = 'welcome' | 'dashboard' | 'projects' | 'messaging' | 'training';

// Token colours only (colour guard): the shapes of the prototype « Présentation de l’outil ».
const card: React.CSSProperties = { fill: 'var(--mairie-surface)', stroke: 'var(--mairie-border)', strokeWidth: 1.5 };
const line: React.CSSProperties = { stroke: 'var(--mairie-border)', strokeWidth: 6, strokeLinecap: 'round' };
const soft: React.CSSProperties = { fill: 'var(--mairie-accent-surface)' };
const accent: React.CSSProperties = { fill: 'var(--mairie-accent)' };
const moduleFill = (name: string): React.CSSProperties => ({ fill: `var(--mairie-module-${name})` });
const delay = (ms: number): React.CSSProperties => ({ animationDelay: `${ms}ms` });

function Dashboard() {
  const bars = [28, 46, 36, 58, 40, 50, 30, 54];
  const colours = ['projects', 'dashboard', 'messaging', 'calendar'];
  return (
    <>
      {[70, 201, 332].map((x, index) => <rect key={x} className="mairie-rise" style={{ ...card, ...delay(index * 80) }} x={x} y="30" width="118" height="70" rx="10" />)}
      <path style={line} d="M88 52h50M219 52h40M350 52h56" />
      <rect className="mairie-grow-x" style={moduleFill('dashboard')} x="88" y="70" width="80" height="12" rx="6" />
      <rect className="mairie-grow-x" style={{ ...moduleFill('projects'), ...delay(120) }} x="219" y="70" width="56" height="12" rx="6" />
      <rect className="mairie-grow-x" style={{ ...moduleFill('calendar'), ...delay(240) }} x="350" y="70" width="70" height="12" rx="6" />
      <rect className="mairie-rise" style={{ ...card, ...delay(200) }} x="70" y="112" width="380" height="80" rx="10" />
      {bars.map((height, index) => <rect key={index} className="mairie-grow-y" style={{ ...moduleFill(colours[index % 4]), ...delay(300 + index * 60) }} x={98 + index * 42} y={178 - height} width="22" height={height} rx="4" />)}
    </>
  );
}

function Projects() {
  const cards: [number, number, string][] = [[0, 0, 'projects'], [0, 1, 'dashboard'], [1, 0, 'calendar'], [2, 0, 'projects'], [1, 1, 'messaging']];
  return (
    <>
      {[0, 1, 2].map(column => <g key={column}><rect style={soft} x={60 + column * 110} y="24" width="98" height="164" rx="10" /><path style={line} d={`M${74 + column * 110} 42h40`} /></g>)}
      {cards.map(([column, row, colour], index) => (
        <g key={index} className="mairie-rise" style={delay(index * 90)}>
          <rect style={card} x={68 + column * 110} y={56 + row * 58} width="82" height="48" rx="8" />
          <rect style={moduleFill(colour)} x={76 + column * 110} y={66 + row * 58} width="28" height="8" rx="4" />
          <path style={{ ...line, strokeWidth: 5 }} d={`M${78 + column * 110} ${88 + row * 58}h48`} />
        </g>
      ))}
      <g className="mairie-rise" style={delay(450)}>
        <rect style={card} x="400" y="40" width="80" height="84" rx="10" />
        <rect style={moduleFill('calendar')} x="400" y="40" width="80" height="22" rx="10" />
        <rect style={moduleFill('calendar')} x="400" y="52" width="80" height="10" />
        {[0, 1, 2, 3, 4, 5].map(day => <rect key={day} className={day === 4 ? 'mairie-pop' : undefined} style={day === 4 ? { ...accent, ...delay(700) } : soft} x={410 + (day % 3) * 22} y={72 + Math.floor(day / 3) * 22} width="16" height="16" rx="4" />)}
      </g>
    </>
  );
}

function Messaging() {
  return (
    <>
      <g className="mairie-pop"><rect style={card} x="90" y="34" width="190" height="44" rx="14" /><path style={{ ...line, strokeWidth: 5 }} d="M108 52h120M108 64h80" /></g>
      <g className="mairie-pop" style={delay(250)}><rect style={moduleFill('messaging')} x="170" y="92" width="190" height="44" rx="14" /><path style={{ stroke: 'var(--mairie-on-module)', strokeWidth: 5, strokeLinecap: 'round', opacity: 0.85 }} d="M188 110h130M188 122h70" /></g>
      <g className="mairie-pop" style={delay(500)}><rect style={card} x="90" y="150" width="120" height="36" rx="14" />{[118, 134, 150].map(cx => <circle key={cx} style={accent} cx={cx} cy="168" r="4" />)}</g>
      <g transform="translate(400 70)">
        <path style={card} d="M-30 40c0-24 8-40 30-40s30 16 30 40l7 12h-74z" />
        <path style={{ fill: 'none', stroke: 'var(--mairie-accent)', strokeWidth: 3, strokeLinecap: 'round' }} d="M-8 60a8 8 0 0 0 16 0" />
        <g className="mairie-pop" style={delay(800)}>
          <rect style={{ fill: 'var(--mairie-counter-background)' }} x="14" y="-12" width="30" height="22" rx="7" />
          <text x="29" y="4" textAnchor="middle" style={{ fill: 'var(--mairie-on-counter)', font: '700 11px sans-serif' }}>9+</text>
        </g>
      </g>
    </>
  );
}

function Training() {
  return (
    <>
      <g className="mairie-rise">
        <rect style={card} x="110" y="40" width="170" height="130" rx="12" />
        <rect style={moduleFill('training')} x="110" y="40" width="170" height="72" rx="12" />
        <rect style={moduleFill('training')} x="110" y="96" width="170" height="16" />
        <circle className="mairie-pop" style={{ fill: 'var(--mairie-surface)' }} cx="195" cy="76" r="20" />
        <path className="mairie-pop" style={{ ...moduleFill('training'), ...delay(150) }} d="M189 66l16 10-16 10z" />
        <path style={{ ...line, strokeWidth: 5 }} d="M126 130h90" />
        <rect style={soft} x="126" y="148" width="138" height="8" rx="4" />
        <rect className="mairie-grow-x" style={{ ...accent, animationDelay: '400ms', animationDuration: '1200ms' }} x="126" y="148" width="92" height="8" rx="4" />
      </g>
      {[0, 1, 2].map(row => (
        <g key={row} className="mairie-rise" style={delay(200 + row * 120)}>
          <rect style={card} x="304" y={44 + row * 44} width="130" height="34" rx="9" />
          <circle style={row < 2 ? accent : soft} cx="322" cy={61 + row * 44} r="9" />
          {row < 2 ? <path style={{ stroke: 'var(--mairie-surface)', strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }} d={`M317.5 ${61 + row * 44}l3 3 6-6`} /> : null}
          <path style={{ ...line, strokeWidth: 5 }} d={`M340 ${61 + row * 44}h${[70, 54, 62][row]}`} />
        </g>
      ))}
    </>
  );
}

const scenes: Record<Exclude<OnboardingArtName, 'welcome'>, () => React.ReactElement> = { dashboard: Dashboard, projects: Projects, messaging: Messaging, training: Training };

/**
 * The illustration of an Onboarding slide (MAIR-1097), drawn with the theme tokens on
 * `--mairie-illustration-background`. Shapes enter once (no loop) and only for users allowing motion.
 * `welcome` is the logo intro, played when `intro` is on.
 */
export function OnboardingArt({ name, intro = true }: { name: OnboardingArtName; intro?: boolean }) {
  if (name === 'welcome') return <span className="flex h-full w-full items-center justify-center"><LogoIntro animate={intro} /></span>;
  const Scene = scenes[name];
  return <svg aria-hidden="true" focusable="false" data-art={name} className="mairie-onboarding-art block h-full w-full" viewBox="0 0 520 210"><Scene /></svg>;
}
