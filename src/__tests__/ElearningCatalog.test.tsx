import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ElearningCatalog } from '../components/ElearningCatalog';
it('filters received courses independently of French accents', async () => { const user = userEvent.setup(); render(<ElearningCatalog courses={[{ id: 'a', title: 'Écologie', description: 'Agir' }, { id: 'b', title: 'Budget', description: 'Préparer' }]} />); await user.type(screen.getByPlaceholderText('Rechercher une formation...'), 'ecologie'); expect(screen.getByRole('heading', { name: 'Écologie' })).toBeVisible(); expect(screen.queryByRole('heading', { name: 'Budget' })).not.toBeInTheDocument(); });
