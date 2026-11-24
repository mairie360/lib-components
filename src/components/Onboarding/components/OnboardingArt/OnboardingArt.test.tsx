import React from 'react';
import { render } from '@testing-library/react';

import { OnboardingArt } from './OnboardingArt';

describe('MAIR-1097 OnboardingArt', () => {
  it.each(['dashboard', 'projects', 'messaging', 'training'] as const)('draws the %s scene with tokens only', name => {
    const { container } = render(<OnboardingArt name={name} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('data-art', name);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg.outerHTML).not.toMatch(/#[\da-f]{3,6}\b|rgb\(/i);
  });

  it('plays the logo intro on the welcome slide unless told otherwise', () => {
    const { container, rerender } = render(<OnboardingArt name="welcome" />);
    expect(container.querySelector('[data-logo-intro="animated"]')).not.toBeNull();
    rerender(<OnboardingArt name="welcome" intro={false} />);
    expect(container.querySelector('[data-logo-intro="static"]')).not.toBeNull();
  });
});
