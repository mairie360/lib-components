import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemContainer } from '../components/ItemContainer';
import { axe } from 'jest-axe';
const items = [{ id: 'a', title: 'Conseil' }, { id: 'b', title: 'Budget', description: 'À préparer' }];
it('filters received items and submits a trimmed new item with the Enter key', async () => {
  const user = userEvent.setup(); const onAddItem = jest.fn(); render(<ItemContainer title="À faire" items={items} onAddItem={onAddItem} />);
  await user.type(screen.getByRole('textbox', { name: 'Rechercher des éléments' }), 'bud'); expect(screen.queryByText('Conseil')).not.toBeInTheDocument(); expect(screen.getByText('Budget')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Ajouter un élément' })); const dialog = screen.getByRole('dialog', { name: 'Ajouter un nouvel élément' });
  expect(within(dialog).getByRole('button', { name: 'Ajouter' })).toBeDisabled(); await user.type(within(dialog).getByPlaceholderText('Titre'), '  Réunion  '); await user.type(within(dialog).getByPlaceholderText('Description (facultative)'), ' Salle 1 {Enter}');
  expect(onAddItem).toHaveBeenCalledWith('Réunion', 'Salle 1'); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('updates container metadata and requests deletion only after browser confirmation', async () => {
  const user = userEvent.setup(); const onTitleChange = jest.fn(); const onDescriptionChange = jest.fn(); const onStatusColorChange = jest.fn(); const onItemDelete = jest.fn();
  render(<ItemContainer title="À faire" items={items} onTitleChange={onTitleChange} onDescriptionChange={onDescriptionChange} onStatusColorChange={onStatusColorChange} onItemDelete={onItemDelete} />);
  await user.click(screen.getByRole('button', { name: 'Ouvrir le menu du conteneur' })); await user.click(screen.getByRole('button', { name: 'Modifier' }));
  fireEvent.change(screen.getByLabelText('Titre'), { target: { value: ' Planifié ' } }); fireEvent.change(screen.getByLabelText('Description'), { target: { value: ' Semaine ' } });
  await user.click(screen.getByRole('button', { name: 'Sélectionner la couleur bg-blue-500' })); await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
  expect(onTitleChange).toHaveBeenCalledWith('Planifié'); expect(onDescriptionChange).toHaveBeenCalledWith('Semaine'); expect(onStatusColorChange).toHaveBeenCalledWith('bg-blue-500');
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  await user.click(screen.getByRole('button', { name: 'Ouvrir le menu du conteneur' })); await user.click(screen.getByRole('button', { name: 'Supprimer tous les éléments' })); expect(onItemDelete).not.toHaveBeenCalled();
  confirm.mockReturnValue(true); await user.click(screen.getByRole('button', { name: 'Ouvrir le menu du conteneur' })); await user.click(screen.getByRole('button', { name: 'Supprimer tous les éléments' })); expect(onItemDelete.mock.calls).toEqual([['a'], ['b']]); confirm.mockRestore();
});
it('has accessible controls and closes the currently open container menu on an outside click', async () => {
  const user = userEvent.setup(); const { container } = render(<ItemContainer title="À faire" items={[]} />);
  await user.click(screen.getByRole('button', { name: 'Ouvrir le menu du conteneur' })); await user.click(document.body); expect(screen.queryByRole('button', { name: 'Exporter JSON' })).not.toBeInTheDocument(); expect((await axe(container)).violations).toEqual([]);
});

it('keeps item selection separate from container controls and allows cancelling an empty add draft', async () => {
  const user = userEvent.setup(); const onItemClick = jest.fn(); const onAddItem = jest.fn();
  render(<ItemContainer title="À faire" items={items} onItemClick={onItemClick} onAddItem={onAddItem} />);
  await user.click(screen.getByRole('button', { name: 'Ouvrir Conseil' })); expect(onItemClick).toHaveBeenCalledWith('a');
  await user.click(screen.getByRole('button', { name: 'Ajouter un élément' }));
  fireEvent.keyDown(screen.getByPlaceholderText('Description (facultative)'), { key: 'Enter' }); expect(onAddItem).not.toHaveBeenCalled();
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Annuler' })); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Ouvrir le menu du conteneur' })); await user.click(screen.getByRole('button', { name: 'Modifier' }));
  await user.click(screen.getByRole('button', { name: 'Annuler' })); expect(screen.queryByLabelText('Titre')).not.toBeInTheDocument();
});

it('exports the received items as a real JSON download and releases its temporary object URL', async () => {
  const createObjectURL = URL.createObjectURL; const revokeObjectURL = URL.revokeObjectURL;
  const create = jest.fn<string, [Blob | MediaSource]>(() => 'blob:items-export'); const revoke = jest.fn(); URL.createObjectURL = create; URL.revokeObjectURL = revoke;
  let filename = ''; const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { filename = this.download; });
  try {
    render(<ItemContainer title="À faire" items={items} />); await userEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu du conteneur' })); await userEvent.click(screen.getByRole('button', { name: 'Exporter JSON' }));
    expect(filename).toBe('items.json'); expect(revoke).toHaveBeenCalledWith('blob:items-export');
    const blob = create.mock.calls[0][0] as Blob;
    const text = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsText(blob); });
    expect(JSON.parse(text)).toEqual([{ id: 'a', title: 'Conseil' }, { id: 'b', title: 'Budget', description: 'À préparer' }]);
  } finally { URL.createObjectURL = createObjectURL; URL.revokeObjectURL = revokeObjectURL; click.mockRestore(); }
});

it('opens and closes the add panel through two pointer clicks on its trigger', async () => {
  const user = userEvent.setup(); render(<ItemContainer title="À faire" items={items} />);
  const trigger = screen.getByRole('button', { name: 'Ajouter un élément' });
  await user.click(trigger); expect(screen.getByRole('dialog', { name: 'Ajouter un nouvel élément' })).toBeVisible(); expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await user.click(trigger); expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
it('starts and cancels an actual keyboard drag through its parent board sensors', async () => {
  const user = userEvent.setup(); render(<ItemContainer title="À faire" items={items} />);
  const handle = screen.getByRole('button', { name: 'Déplacer Conseil' }); handle.focus(); await user.keyboard(' ');
  expect(handle).toHaveAttribute('aria-pressed', 'true'); expect(screen.getByRole('status')).toHaveTextContent(/draggable item a/i);
  await user.keyboard('{Escape}'); expect(handle).not.toHaveAttribute('aria-pressed', 'true'); expect(screen.getByRole('status')).toHaveTextContent(/cancelled/i); expect(handle).toHaveFocus();
});
