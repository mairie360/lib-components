import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { ProjectModule } from '../components/ProjectModule';

describe('ProjectModule', () => {
  it('renders the projects kanban with default municipal projects', () => {
    render(<ProjectModule />);

    expect(screen.getByRole('heading', { name: 'Projets' })).toBeInTheDocument();
    expect(screen.getByText('Aménagement du parc central')).toBeInTheDocument();
    expect(screen.getByText('Digitalisation des archives')).toBeInTheDocument();
    expect(screen.getAllByText('À faire').length).toBeGreaterThan(0);
    expect(screen.getAllByText('En cours').length).toBeGreaterThan(0);
    expect(screen.getAllByText('En révision').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Terminé').length).toBeGreaterThan(0);
  });

  it('switches between kanban, grid and table views', () => {
    render(<ProjectModule />);

    fireEvent.click(screen.getByRole('tab', { name: /Grille/ }));
    expect(screen.getByRole('tab', { name: /Grille/ })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('tab', { name: /Table/ }));
    expect(screen.getByRole('tab', { name: /Table/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('columnheader', { name: 'Projet' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Responsable' })).toBeInTheDocument();
  });

  it('filters projects by search, status and priority', () => {
    render(<ProjectModule />);

    fireEvent.change(screen.getByPlaceholderText('Rechercher des projets...'), {
      target: { value: 'archives' },
    });

    expect(screen.getByText('Digitalisation des archives')).toBeInTheDocument();
    expect(screen.queryByText('Aménagement du parc central')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Rechercher des projets...'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Filtrer par statut' }));
    fireEvent.click(screen.getByRole('option', { name: 'En révision' }));

    expect(screen.getByText('Installation système éclairage LED')).toBeInTheDocument();
    expect(screen.queryByText('Digitalisation des archives')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Filtrer par priorité' }));
    fireEvent.click(screen.getByRole('option', { name: 'Haute' }));

    expect(screen.getByText('Installation système éclairage LED')).toBeInTheDocument();
  });

  it('creates a local project from the modal and calls the callback', () => {
    const handleCreateProject = jest.fn();
    render(<ProjectModule onCreateProject={handleCreateProject} />);

    fireEvent.click(screen.getByRole('button', { name: 'Nouveau projet' }));
    const dialog = screen.getByRole('dialog', { name: 'Nouveau projet' });

    fireEvent.change(within(dialog).getByLabelText(/Titre/), {
      target: { value: 'Réhabilitation du marché couvert' },
    });
    fireEvent.change(within(dialog).getByLabelText(/Description/), {
      target: { value: 'Remise aux normes des halles et amélioration des accès publics' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Assigné principal' }));
    fireEvent.click(screen.getByRole('option', { name: 'Marie Dubois' }));
    fireEvent.change(within(dialog).getByPlaceholderText('Ajouter une tâche...'), {
      target: { value: 'Réaliser le diagnostic technique' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ajouter la tâche' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Créer le projet' }));

    expect(handleCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Réhabilitation du marché couvert',
        description: 'Remise aux normes des halles et amélioration des accès publics',
        status: 'todo',
        priority: 'medium',
      })
    );
    expect(screen.queryByRole('dialog', { name: 'Nouveau projet' })).not.toBeInTheDocument();
    expect(screen.getByText('Réhabilitation du marché couvert')).toBeInTheDocument();
  });

  it('edits a project from the action menu', () => {
    const handleUpdateProject = jest.fn();
    const handleProjectAction = jest.fn();
    render(<ProjectModule onUpdateProject={handleUpdateProject} onProjectAction={handleProjectAction} />);

    fireEvent.click(screen.getByRole('button', { name: 'Actions pour Aménagement du parc central' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Modifier' }));

    const dialog = screen.getByRole('dialog', { name: 'Modifier le projet' });
    fireEvent.change(within(dialog).getByLabelText(/Titre/), {
      target: { value: 'Aménagement du parc central actualisé' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }));

    expect(handleProjectAction).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Aménagement du parc central' }),
      'edit'
    );
    expect(handleUpdateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'central-park',
        title: 'Aménagement du parc central actualisé',
      })
    );
    expect(screen.queryByRole('dialog', { name: 'Modifier le projet' })).not.toBeInTheDocument();
    expect(screen.getByText('Aménagement du parc central actualisé')).toBeInTheDocument();
  });

  it('shows project settings feedback', () => {
    const handleSettingsClick = jest.fn();
    render(<ProjectModule onSettingsClick={handleSettingsClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Paramètres' }));

    expect(handleSettingsClick).toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Paramètres en cours de développement.');
  });
});
