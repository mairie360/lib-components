import React from 'react';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { axe } from 'jest-axe';

import { QrCode } from './QrCode';

const uri = 'otpauth://totp/Mairie360:camille@example.fr?secret=JBSWY3DPEHPK3PXP&issuer=Mairie360';

// MAIR-1068: Figma `Base/QrCode`: inline SVG, always black on white, labelled image.
describe('MAIR-1068 QrCode', () => {
  it('draws an image with an accessible name and black modules on a white background', () => {
    const { container } = render(<QrCode value={uri} />);
    const svg = screen.getByRole('img', { name: 'Code QR' });
    expect(svg.querySelector('rect')).toHaveAttribute('fill', 'var(--mairie-qr-light)');
    const path = svg.querySelector('path')!;
    expect(path).toHaveAttribute('fill', 'var(--mairie-qr-dark)');
    expect(path.getAttribute('d')!.length).toBeGreaterThan(100);
    expect(container.querySelector('img')).toBeNull();
  });

  it('is deterministic and depends on the value', () => {
    const modules = (value: string) => render(<QrCode value={value} />).container.querySelector('path')!.getAttribute('d');
    expect(modules(uri)).toBe(modules(uri));
    expect(modules(uri)).not.toBe(modules(`${uri}0`));
  });

  it('keeps the four-module quiet zone: no dark module touches the border', () => {
    const { container } = render(<QrCode value="abc" />);
    const svg = container.querySelector('svg')!;
    const span = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
    const d = container.querySelector('path')!.getAttribute('d')!;
    const points = [...d.matchAll(/M(\d+) (\d+)h/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(points.every(([x, y]) => x >= 4 && y >= 4 && x < span - 4 && y < span - 4)).toBe(true);
  });

  it('takes a size, a label and keeps the consumer class; marks its root', () => {
    const { container } = render(<QrCode value="abc" size={240} label="Code QR de la clé" className="m-2" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveStyle({ width: '240px', height: '240px' });
    expect(root).toHaveClass('m-2');
    expect(root).toHaveAttribute('data-m360-component', 'QrCode');
    expect(screen.getByRole('img', { name: 'Code QR de la clé' })).toBeInTheDocument();
  });

  it('has no accessibility violation', async () => {
    const { container } = render(<QrCode value={uri} />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('binds tokens that stay black on white in Light and Dark', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/municipal-theme.css'), 'utf8');
    expect(css).toMatch(/--mairie-qr-light: #ffffff;/);
    expect(css).toMatch(/--mairie-qr-dark: #000000;/);
    expect(css.match(/--mairie-qr-(light|dark):/g)).toHaveLength(2); // never redefined for the dark theme
  });
});
