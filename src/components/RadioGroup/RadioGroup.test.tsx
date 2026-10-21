import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from './RadioGroup';

describe('RadioGroup (MAIR-608)', () => {
  it('renders a named group and reports the chosen option', async () => {
    const user = userEvent.setup(); const onTheme = jest.fn();
    render(<RadioGroup label="Thème" name="theme" options={[{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }]} defaultValue="light" onChange={onTheme} />);
    expect(screen.getByRole('group', { name: 'Thème' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Sombre' }));
    expect(onTheme).toHaveBeenCalledWith('dark');
    expect(screen.getByRole('radio', { name: 'Sombre' })).toBeChecked();
  });
});
