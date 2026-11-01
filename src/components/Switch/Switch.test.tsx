import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';

describe('Switch (MAIR-608)', () => {
  it('toggles and keeps a hidden form value', async () => {
    const user = userEvent.setup(); const onSwitch = jest.fn();
    const { container } = render(<Switch label="Ouverture automatique" name="auto_open" onChange={onSwitch} />);
    const toggle = screen.getByRole('switch', { name: 'Ouverture automatique' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(onSwitch).toHaveBeenCalledWith(true);
    expect(container.querySelector('input[name="auto_open"]')).toHaveValue('true');
  });
});
