import { fireEvent, render, screen } from '@testing-library/react';
import { Slider } from './Slider';

describe('Slider (MAIR-608)', () => {
  it('reports numbers and announces the formatted value', () => {
    const onSlide = jest.fn();
    render(<Slider label="Taille de police" min={14} max={24} defaultValue={16} format={(v) => `${v} px`} onChange={onSlide} />);
    const slider = screen.getByRole('slider', { name: 'Taille de police' });
    expect(slider).toHaveAttribute('aria-valuetext', '16 px');
    fireEvent.change(slider, { target: { value: '20' } });
    expect(onSlide).toHaveBeenCalledWith(20);
    expect(screen.getByText('20 px')).toBeInTheDocument();
  });
  it('announces a slider value only when the formatted value is text (CodeRabbit on #467)', () => {
    const { rerender } = render(<Slider label="Taille" min={12} max={24} value={16} format={(v) => `${v} px`} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '16 px');
    rerender(<Slider label="Taille" min={12} max={24} value={16} format={(v) => <strong>{v}</strong>} />);
    expect(screen.getByRole('slider')).not.toHaveAttribute('aria-valuetext');
  });
});
