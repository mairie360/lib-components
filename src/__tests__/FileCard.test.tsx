import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileCard } from '../components/FileCard';
import type { LibraryFile } from '../components/files/types';
import { axe } from 'jest-axe';
it('respects allowed file actions and delegates the selected actual file', async () => { const onAction = jest.fn(); const file: LibraryFile = { id: 'f1', name: 'conseil.pdf', type: 'pdf', sizeBytes: 100, sizeLabel: '1 KB', owner: 'Anne', category: 'Conseil', modifiedAt: '2026-10-15', allowedActions: ['open', 'download'] }; const { container } = render(<FileCard file={file} onAction={onAction} />); await userEvent.click(screen.getByRole('button', { name: 'Ouvrir conseil.pdf' })); expect(onAction).toHaveBeenLastCalledWith(file, 'open'); await userEvent.click(screen.getByRole('button', { name: 'Télécharger conseil.pdf' })); expect(onAction).toHaveBeenLastCalledWith(file, 'download'); expect(screen.queryByRole('button', { name: 'Partager conseil.pdf' })).not.toBeInTheDocument(); expect((await axe(container)).violations).toEqual([]); });
