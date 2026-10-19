import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUploadModal } from '../components/FileUploadModal';
import { axe } from 'jest-axe';
it('requires a file and category before delegating an upload', async () => { const user = userEvent.setup(); const onUpload = jest.fn(); const { container } = render(<FileUploadModal isOpen categories={['Conseil']} onCancel={jest.fn()} onUpload={onUpload} />); await user.click(screen.getByRole('button', { name: /Télécharger|Importer/ })); expect(screen.getByRole('alert')).toBeVisible(); expect(onUpload).not.toHaveBeenCalled(); const file = new File(['PDF'], 'conseil.pdf', { type: 'application/pdf' }); fireEvent.change(screen.getByLabelText('Choisir un fichier'), { target: { files: [file] } }); await user.selectOptions(screen.getByLabelText('Catégorie'), 'Conseil'); await user.click(screen.getByRole('button', { name: /Télécharger|Importer/ })); expect(onUpload).toHaveBeenCalledWith({ file, category: 'Conseil' }); expect((await axe(container)).violations).toEqual([]); });
