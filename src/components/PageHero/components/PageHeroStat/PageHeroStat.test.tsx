import React from 'react';
import { render, screen } from '@testing-library/react';

import { PageHeroStat } from './PageHeroStat';

describe('MAIR-1105 PageHeroStat', () => {
  it('is a button by default and a link with href, the whole tile', () => {
    const { rerender } = render(<PageHeroStat label="Sessions actives" value={2} />);
    expect(screen.getByRole('button', { name: 'Sessions actives : 2' })).toHaveAttribute('type', 'button');
    rerender(<PageHeroStat label="Sessions actives" value={2} href="/sessions" />);
    const link = screen.getByRole('link', { name: 'Sessions actives : 2' });
    expect(link).toHaveTextContent('Sessions actives2');
    expect(link).toHaveAttribute('data-m360-component', 'PageHeroStat');
  });
});
