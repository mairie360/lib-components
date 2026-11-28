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

describe('MAIR-1260 artifact filter selects', () => {
  const options = [{ value: 'admin', label: 'Administrateur' }, { value: 'agent', label: 'Agent' }] as const;
  it('reads « Rôle : tous » without a value and keeps the funnel by default', () => {
    const { container } = render(<FilterSelect label="Rôle" allLabel="tous" showAllLabel options={options} value="" onChange={() => undefined} />);
    expect(container).toHaveTextContent('Rôle : tous');
    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });
  it('drops the funnel with icon={false} and shows the chosen value', () => {
    const { container } = render(<FilterSelect label="Rôle" allLabel="tous" showAllLabel icon={false} options={options} value="agent" onChange={() => undefined} />);
    expect(container).toHaveTextContent('Rôle : Agent');
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });
  it('names the menu button « Statut : tous » in menu mode', () => {
    render(<FilterSelect mode="menu" label="Statut" allLabel="tous" showAllLabel icon={false} options={options} value="" onChange={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Statut : tous' })).toBeInTheDocument();
  });
  it('keeps the bare label without showAllLabel', () => {
    const { container } = render(<FilterSelect label="Rôle" options={options} value="" onChange={() => undefined} />);
    expect(container).toHaveTextContent(/^Rôle/);
    expect(container).not.toHaveTextContent('Rôle : ');
  });
});
