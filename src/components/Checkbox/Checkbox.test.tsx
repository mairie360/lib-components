import { render, screen } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox (MAIR-608)', () => {
  it('renders a labelled checkbox with its hint and default state', () => {
    render(<Checkbox label="Recevoir les notifications" hint="Par e-mail" defaultChecked />);
    const box = screen.getByRole('checkbox', { name: 'Recevoir les notifications' });
    expect(box).toBeChecked();
    expect(box).toHaveAccessibleDescription('Par e-mail');
  });
});
