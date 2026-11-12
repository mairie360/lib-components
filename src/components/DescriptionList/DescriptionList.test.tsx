import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { DescriptionList } from './DescriptionList';

describe('DescriptionList (MAIR-930)', () => {
  it('pairs each label with its value in a dl, long values wrapping', async () => {
    const { container } = render(<DescriptionList items={[{ label: 'Navigateur', value: 'Firefox 132' }, { label: 'Système', value: 'Windows', id: 'os' }]} labelWidth={200} />);
    const terms = screen.getAllByRole('term');
    expect(terms.map(term => term.textContent)).toEqual(['Navigateur', 'Système']);
    expect(screen.getAllByRole('definition')[0]).toHaveTextContent('Firefox 132');
    expect(screen.getAllByRole('definition')[0]).toHaveClass('break-words');
    expect(terms[0].style.width).toBe('min(100%, 200px)');
    expect((await axe(container)).violations).toEqual([]);
  });
});
