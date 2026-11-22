import React from 'react';
import { render } from '@testing-library/react';

import { LoadingDots } from './LoadingDots';

describe('MAIR-1098 LoadingDots', () => {
  it('renders three decorative dots sized on the state', () => {
    const { container } = render(<LoadingDots size="l" />);
    const dots = container.querySelectorAll<HTMLElement>('.mairie-loading-dot');
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(dots).toHaveLength(3);
    expect(dots[0].style.width).toBe('10px');
  });
});
