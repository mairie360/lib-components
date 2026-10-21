import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from 'lucide-react';
import { IconButton } from './IconButton';

describe('IconButton (MAIR-608)', () => {
  it('requires an accessible name and supports a pressed state', async () => {
    const user = userEvent.setup(); const click = jest.fn();
    const { rerender } = render(<IconButton icon={Calendar} label="Ouvrir le calendrier" onClick={click} />);
    await user.click(screen.getByRole('button', { name: 'Ouvrir le calendrier' })); expect(click).toHaveBeenCalledTimes(1);
    rerender(<IconButton icon={Calendar} label="Épingler" pressed />);
    expect(screen.getByRole('button', { name: 'Épingler' })).toHaveAttribute('aria-pressed', 'true');
  });
});
