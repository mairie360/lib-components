import React from 'react';
import { render } from '@testing-library/react';

import { EmptyIllustration } from './EmptyIllustration';

describe('MAIR-1098 EmptyIllustration', () => {
  it('is a decorative town hall drawn with the theme classes, larger at l', () => {
    const { container, rerender } = render(<EmptyIllustration size="m" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '132');
    expect(svg.querySelector('.mairie-ill-flag')).not.toBeNull();
    expect(svg.querySelector('.mairie-ill-envelope')).not.toBeNull();
    expect(svg.querySelectorAll('.mairie-ill-spark, .mairie-ill-spark-accent')).toHaveLength(4);
    // No colour attribute: every colour comes from a token class.
    expect(svg.innerHTML).not.toMatch(/(fill|stroke)="#/);
    rerender(<EmptyIllustration size="l" />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '176');
  });
});
