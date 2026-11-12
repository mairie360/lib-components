import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { FilterSelect } from './FilterSelect';

describe('FilterSelect (MAIR-608)', () => {
  it('shows the active filter value and clears it', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(<FilterSelect label="Statut" options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]} value="" onChange={onChange} />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Statut' }), 'active');
    expect(onChange).toHaveBeenCalledWith('active');
    rerender(<FilterSelect label="Statut" options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]} value="active" onChange={onChange} />);
    expect(screen.getByText('Statut : Actif')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Statut' }).parentElement).toHaveAttribute('data-active', 'true');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Statut' }), '');
    expect(onChange).toHaveBeenLastCalledWith('');
  });
});

describe('FilterSelect menu mode (MAIR-849)', () => {
  const options = [{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }, { value: 'archived', label: 'Archivé', disabled: true }];

  it('opens a labelled menu of radio choices and picks one', async () => {
    const user = userEvent.setup(); const onChange = jest.fn();
    const { container } = render(<FilterSelect mode="menu" label="Statut" options={options} value="" onChange={onChange} />);
    const button = screen.getByRole('button', { name: 'Statut' });
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu', { name: 'Statut' });
    expect(screen.getAllByRole('menuitemradio').map(item => item.textContent)).toEqual(['Tous', 'Actif', 'Inactif', 'Archivé']);
    expect(screen.getByRole('menuitemradio', { name: 'Tous' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Tous' })).toHaveFocus();
    expect(menu).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
    await user.click(screen.getByRole('menuitemradio', { name: 'Inactif' }));
    expect(onChange).toHaveBeenCalledWith('inactive');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('moves with the arrow keys, skips disabled choices, closes on Escape and shows the active value', async () => {
    const user = userEvent.setup(); const onChange = jest.fn();
    render(<><FilterSelect mode="menu" label="Statut" options={options} value="active" onChange={onChange} /><p>Ailleurs</p></>);
    const button = screen.getByRole('button', { name: 'Statut : Actif' });
    expect(button).toHaveAttribute('data-active', 'true');
    button.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitemradio', { name: 'Actif' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitemradio', { name: 'Inactif' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitemradio', { name: 'Tous' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('menuitemradio', { name: 'Inactif' })).toHaveFocus();
    await user.keyboard('{Home}{ArrowUp}');
    expect(screen.getByRole('menuitemradio', { name: 'Inactif' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('active');
    await user.click(button);
    await user.click(screen.getByText('Ailleurs'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
