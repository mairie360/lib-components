import { render, screen } from '@testing-library/react';
import { ProgressMeter } from './ProgressMeter';

describe('ProgressMeter (MAIR-608)', () => {
  it('exposes a clamped progressbar with its label and percentage', () => {
    const { rerender } = render(<ProgressMeter label="Avancement" value={64.4} tone="success" />);
    const bar = screen.getByRole('progressbar', { name: 'Avancement' });
    expect(bar).toHaveAttribute('aria-valuenow', '64'); expect(screen.getByText('64 %')).toBeInTheDocument();
    rerender(<ProgressMeter label="Avancement" value={140} showValue={false} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100'); expect(screen.queryByText('100 %')).not.toBeInTheDocument();
    rerender(<ProgressMeter label="Avancement" value={Number.NaN} />); expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});
