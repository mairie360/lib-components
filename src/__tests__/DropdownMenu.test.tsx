import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuShortcut } from '../components/DropdownMenu';
import { axe } from 'jest-axe';

it('opens with a custom trigger callback, activates an action with keyboard and dismisses with Escape/outside', async () => {
  const user = userEvent.setup(); const onTrigger = jest.fn(); const onSelect = jest.fn(); const { container } = render(<DropdownMenu><DropdownMenuTrigger onClick={onTrigger}>Actions</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuGroup><DropdownMenuLabel>Compte</DropdownMenuLabel><DropdownMenuItem asChild onClick={onSelect}><button>Ouvrir le profil</button></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut></DropdownMenuGroup></DropdownMenuContent></DropdownMenu>);
  await user.click(screen.getByRole('button', { name: 'Actions' })); expect(onTrigger).toHaveBeenCalledTimes(1); screen.getByRole('button', { name: 'Ouvrir le profil' }).focus(); await user.keyboard('{Enter}'); expect(onSelect).toHaveBeenCalledTimes(1); expect(screen.queryByText('Compte')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Actions' })); await user.keyboard('{Escape}'); expect(screen.queryByText('Compte')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Actions' })); await user.click(document.body); expect(screen.queryByText('Compte')).not.toBeInTheDocument(); expect((await axe(container)).violations).toEqual([]);
});
it('does not dispatch disabled child actions and supports a controlled menu', async () => {
  const onChild = jest.fn(); const onItem = jest.fn(); const onOpenChange = jest.fn();
  render(<DropdownMenu open onOpenChange={onOpenChange}><DropdownMenuTrigger asChild><button>Actions</button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem asChild disabled onClick={onItem}><button onClick={onChild}>Refusé</button></DropdownMenuItem></DropdownMenuContent></DropdownMenu>);
  fireEvent.click(screen.getByRole('button', { name: 'Refusé' })); expect(onChild).not.toHaveBeenCalled(); expect(onItem).not.toHaveBeenCalled(); expect(onOpenChange).not.toHaveBeenCalled();
});
it('delegates checked and radio choices and ignores disabled choices', () => {
  const onClick = jest.fn(); const onValueChange = jest.fn(); render(<DropdownMenu open><DropdownMenuContent><DropdownMenuCheckboxItem checked onClick={onClick}>Notifications</DropdownMenuCheckboxItem><DropdownMenuRadioGroup value="a" onValueChange={onValueChange}><DropdownMenuRadioItem value="a">Accueil</DropdownMenuRadioItem><DropdownMenuRadioItem value="b">Budget</DropdownMenuRadioItem><DropdownMenuRadioItem value="c" disabled>Archives</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>);
  fireEvent.click(screen.getByText('Notifications')); expect(onClick).toHaveBeenCalledTimes(1); fireEvent.click(screen.getByText('Budget')); expect(onValueChange).toHaveBeenCalledWith('b'); fireEvent.click(screen.getByText('Archives')); expect(onValueChange).toHaveBeenCalledTimes(1);
});
