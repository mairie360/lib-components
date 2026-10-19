import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdministrationTabs } from '../components/AdministrationTabs';
import { axe } from 'jest-axe';
it('names the selected section and delegates an explicit tab change', async () => {
  const onValueChange = jest.fn(); const { container } = render(<AdministrationTabs value="users" onValueChange={onValueChange} />); expect(screen.getByRole('tab', { name: 'Utilisateurs' })).toHaveAttribute('aria-selected', 'true'); await userEvent.click(screen.getByRole('tab', { name: 'Audit' })); expect(onValueChange).toHaveBeenCalledWith('audit'); expect((await axe(container)).violations).toEqual([]);
});
