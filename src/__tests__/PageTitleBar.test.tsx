import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageTitleBar } from '../components/PageTitleBar';
import { axe } from 'jest-axe';
it('names the page and delegates its explicit primary action', async () => {
  const onAction = jest.fn(); const { container } = render(<PageTitleBar title="Projets" subtitle="Suivi des travaux" actionLabel="Créer un projet" onAction={onAction} />); expect(screen.getByRole('heading', { level: 1, name: 'Projets' })).toBeVisible(); await userEvent.click(screen.getByRole('button', { name: 'Créer un projet' })); expect(onAction).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]);
});
