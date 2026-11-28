import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { icons } from '../Icon';
import { IconChip, iconChipColor } from './IconChip';

// MAIR-1108: Figma `Base/IconChip`, two tones and two sizes, decorative.
describe('MAIR-1108 IconChip', () => {
  it('is a decorative neutral chip of 36 px by default', async () => {
    const { container } = render(<p>Photo <IconChip icon={icons.camera} /></p>);
    const chip = container.querySelector('[data-m360-component="IconChip"]') as HTMLElement;
    expect(chip).toHaveAttribute('aria-hidden', 'true');
    expect(chip).toHaveAttribute('data-tone', 'neutral');
    expect(chip.style.width).toBe('36px');
    expect(chip.style.borderRadius).toBe('var(--mairie-radius-m)');
    expect(chip.style.background).toBe('var(--mairie-accent-surface)');
    expect(chip.style.color).toBe('var(--mairie-accent)');
    expect(chip.style.borderColor).toBe('var(--mairie-border)');
    expect(chip.querySelector('svg')).not.toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('takes the module colour and the on-module ink, 40 px in size l', () => {
    const { container } = render(<IconChip icon={icons['monitor-smartphone']} tone="module" color="calendar" size="l" />);
    const chip = container.firstElementChild as HTMLElement;
    expect(chip.style.width).toBe('40px');
    expect(chip.style.borderRadius).toBe('var(--mairie-radius-l)');
    expect(chip.style.background).toBe('var(--mairie-module-calendar)');
    expect(chip.style.color).toBe('var(--mairie-on-module)');
  });

  it('accepts a theme token as colour and defaults the module to the dashboard', () => {
    expect(iconChipColor()).toBe('var(--mairie-module-dashboard)');
    expect(iconChipColor('var(--mairie-warning-text)')).toBe('var(--mairie-warning-text)');
  });

  it('MAIR-1260: has a 28 px size with a 16 px icon for the artifacts\' metric chips', () => {
    const { container } = render(<p>Inscriptions <IconChip icon={icons.camera} size="s" tone="module" color="training" /></p>);
    const chip = container.querySelector('[data-m360-component="IconChip"]') as HTMLElement;
    expect(chip).toHaveAttribute('data-size', 's');
    expect(chip.style.width).toBe('28px');
    expect(chip.style.height).toBe('28px');
    expect(chip.style.borderRadius).toBe('var(--mairie-radius-m)');
    expect(chip.querySelector('svg')).toHaveAttribute('data-size', 's');
  });
});
