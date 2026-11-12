import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Rating } from './Rating';

describe('Rating (MAIR-841)', () => {
  it('shows one star and the mark in the display variant', async () => {
    const { container } = render(<Rating label="Note moyenne" value={4.8} />);
    const rating = screen.getByRole('img', { name: 'Note moyenne : 4,8 sur 5' });
    expect(rating).toHaveAttribute('data-variant', 'display');
    expect(rating).toHaveTextContent('4,8');
    expect(rating.querySelectorAll('svg')).toHaveLength(1);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('hides the value on demand and stays read only with readOnly', () => {
    render(<><Rating label="Sans valeur" value={3} showValue={false} /><Rating label="Lecture" value={2} onChange={jest.fn()} readOnly /></>);
    expect(screen.getByRole('img', { name: 'Sans valeur : 3 sur 5' })).not.toHaveTextContent('3');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('is a labelled radiogroup of five stars in the input variant', async () => {
    const onChange = jest.fn();
    const { container } = render(<Rating label="Noter cette formation" value={4} onChange={onChange} />);
    const group = screen.getByRole('radiogroup', { name: 'Noter cette formation' });
    expect(group).toHaveAttribute('data-variant', 'input');
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('radio', { name: '4 étoiles sur 5' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '1 étoile sur 5' })).not.toBeChecked();
    await userEvent.setup().click(screen.getByRole('radio', { name: '2 étoiles sur 5' }));
    expect(onChange).toHaveBeenCalledWith(2);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('previews the hovered mark and can be disabled', () => {
    const { container, rerender } = render(<Rating label="Note" value={1} onChange={jest.fn()} />);
    fireEvent.mouseEnter(container.querySelectorAll('label')[3]);
    const coloured = () => Array.from(container.querySelectorAll('svg')).filter(svg => (svg as SVGElement).style.color === 'var(--mairie-rating-active)').length;
    expect(coloured()).toBe(4);
    fireEvent.mouseLeave(screen.getByRole('radiogroup'));
    expect(coloured()).toBe(1);
    rerender(<Rating label="Note" value={1} onChange={jest.fn()} disabled size="l" max={3} />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    screen.getAllByRole('radio').forEach(radio => expect(radio).toBeDisabled());
  });
});
