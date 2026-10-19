import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdministrationSelect } from '../components/AdministrationSelect';
import { axe } from 'jest-axe';
it('selects a received option and dismisses an open menu without selecting another', async () => {
  const user = userEvent.setup(); const onValueChange = jest.fn(); const { container } = render(<AdministrationSelect ariaLabel="Service" value="a" options={[{ value: 'a', label: 'Accueil' }, { value: 'b', label: 'Budget' }]} onValueChange={onValueChange} />);
  await user.click(screen.getByRole('button', { name: 'Service' })); await user.click(screen.getByRole('option', { name: 'Budget' })); expect(onValueChange).toHaveBeenCalledWith('b'); await user.click(screen.getByRole('button', { name: 'Service' })); await user.keyboard('{Escape}'); expect(screen.queryByRole('option')).not.toBeInTheDocument(); expect((await axe(container)).violations).toEqual([]);
});
