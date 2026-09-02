import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { FilesModule } from '../components/FilesModule';

describe('FilesModule', () => {
  it('renders authorized files and their metadata', () => {
    render(<FilesModule />);
    expect(screen.getByRole('heading', { name: 'Gestion des Fichiers' })).toBeInTheDocument();
    expect(screen.getByText('Budget_2024_Final.pdf')).toBeInTheDocument();
    expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Nouveau fichier')).toHaveLength(3);
  });

  it('combines accent-insensitive search and type filtering', () => {
    render(<FilesModule />);
    fireEvent.change(screen.getByPlaceholderText('Rechercher des fichiers...'), { target: { value: 'presentation' } });
    expect(screen.getByText('Presentation_Conseil_Municipal.pptx')).toBeInTheDocument();
    expect(screen.queryByText('Budget_2024_Final.pdf')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Rechercher des fichiers...'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Filtrer par type'), { target: { value: 'image' } });
    expect(screen.getByText('Photo_Inauguration_Parc.jpg')).toBeInTheDocument();
    expect(screen.queryByText('Statistiques_Population.xlsx')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Rechercher des fichiers...'), { target: { value: 'absent' } });
    expect(screen.getByText('Aucun fichier ne correspond à vos critères.')).toBeInTheDocument();
  });

  it('sorts by size and switches between grid and list without changing results', () => {
    render(<FilesModule />);
    fireEvent.change(screen.getByLabelText('Trier les fichiers'), { target: { value: 'size' } });
    const results = screen.getByTestId('files-results');
    expect(within(results).getAllByRole('article')[0]).toHaveTextContent('Archives_2023.zip');
    fireEvent.click(screen.getByRole('button', { name: 'Liste' }));
    expect(screen.getByRole('button', { name: 'Liste' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(results).getAllByRole('article')).toHaveLength(6);
  });

  it('dispatches open, download and share actions', () => {
    const onOpenFile = jest.fn();
    const onDownloadFile = jest.fn();
    const onShareFile = jest.fn();
    render(<FilesModule {...{ onOpenFile, onDownloadFile, onShareFile }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir Budget_2024_Final.pdf' }));
    fireEvent.click(screen.getByRole('button', { name: 'Télécharger Budget_2024_Final.pdf' }));
    fireEvent.click(screen.getByRole('button', { name: 'Partager Budget_2024_Final.pdf' }));
    expect(onOpenFile).toHaveBeenCalledWith(expect.objectContaining({ id: 'budget-2024' }));
    expect(onDownloadFile).toHaveBeenCalledWith(expect.objectContaining({ id: 'budget-2024' }));
    expect(onShareFile).toHaveBeenCalledWith(expect.objectContaining({ id: 'budget-2024' }));
  });

  it('validates an upload and adds the valid file once', () => {
    const onUploadFile = jest.fn();
    render(<FilesModule onUploadFile={onUploadFile} />);
    fireEvent.click(screen.getByRole('button', { name: 'Télécharger un fichier' }));
    const dialog = screen.getByRole('dialog', { name: 'Télécharger un fichier' });
    const file = new File(['contenu'], 'Délibération.pdf', { type: 'application/pdf' });
    fireEvent.change(within(dialog).getByLabelText('Choisir un fichier'), { target: { files: [file] } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Télécharger' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Sélectionnez une catégorie.');
    fireEvent.change(within(dialog).getByRole('combobox'), { target: { value: 'Administration' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Télécharger' }));
    expect(onUploadFile).toHaveBeenCalledWith({ file, category: 'Administration' });
    expect(screen.getByText('Délibération.pdf')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Délibération.pdf a été téléchargé.');
  });

  it('confirms deletion from the contextual menu and cancels safely', () => {
    const onDeleteFile = jest.fn();
    render(<FilesModule onDeleteFile={onDeleteFile} />);
    fireEvent.click(screen.getByRole('button', { name: 'Plus d’actions pour Archives_2023.zip' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Supprimer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(screen.getByText('Archives_2023.zip')).toBeInTheDocument();
    expect(onDeleteFile).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Plus d’actions pour Archives_2023.zip' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Supprimer' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer' }));
    expect(onDeleteFile).toHaveBeenCalledWith(expect.objectContaining({ id: 'archives-2023' }));
    expect(screen.queryByText('Archives_2023.zip')).not.toBeInTheDocument();
  });
});
