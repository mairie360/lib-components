import React from 'react';
import { render } from '@testing-library/react';

import { LogoIntro } from './LogoIntro';

describe('MAIR-1097 LogoIntro', () => {
  it('layers three decorative copies of the logo and a shine, or one static logo', () => {
    const { container, rerender } = render(<LogoIntro />);
    expect(container.querySelectorAll('img')).toHaveLength(3);
    container.querySelectorAll('img').forEach(image => expect(image).toHaveAttribute('alt', ''));
    expect(container.querySelector('.mairie-logo-intro-shine')).not.toBeNull();
    rerender(<LogoIntro animate={false} />);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('[data-logo-intro="static"]')).not.toBeNull();
  });
});
