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
    fireEvent.change(within(dialog).getByLabelText(/Objectifs/), {
      target: { value: 'Sécuriser les halles et améliorer le parcours des commerçants' },
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
        objectives: 'Sécuriser les halles et améliorer le parcours des commerçants',
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

  it('scopes projects by employee, responsable and mayor roles', () => {
    const { rerender } = render(<ProjectModule currentUserRole="employee" currentUserId="sophie-leroy" />);

    expect(screen.getByText('Digitalisation des archives')).toBeInTheDocument();
    expect(screen.getByText('Rénovation de la bibliothèque municipale')).toBeInTheDocument();
    expect(screen.queryByText('Aménagement du parc central')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nouveau projet' })).not.toBeInTheDocument();

    rerender(<ProjectModule currentUserRole="responsable" currentUserId="marie-dubois" />);
    expect(screen.getByText('Création site web municipal')).toBeInTheDocument();
    expect(screen.queryByText('Réfection des routes du centre-ville')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nouveau projet' })).toBeInTheDocument();

    rerender(<ProjectModule currentUserRole="mayor" />);
    expect(screen.getByText('Réfection des routes du centre-ville')).toBeInTheDocument();
  });

  it('filters projects by due date', () => {
    render(<ProjectModule />);

    fireEvent.change(screen.getByLabelText('Filtrer par échéance'), {
      target: { value: '2024-11-30' },
    });

    expect(screen.getByText('Installation système éclairage LED')).toBeInTheDocument();
    expect(screen.getByText('Digitalisation des archives')).toBeInTheDocument();
    expect(screen.queryByText('Aménagement du parc central')).not.toBeInTheDocument();
  });

  it('limits employee task visibility to assigned tasks', () => {
    render(<ProjectModule currentUserRole="employee" currentUserId="thomas-bernard" />);

    expect(screen.getByText('Aménagement du parc central')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Voir les tâches/ }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Actions pour Aménagement du parc central' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Ouvrir' }));

    const dialog = screen.getByRole('dialog', { name: 'Modifier le projet' });
    expect(within(dialog).getByText('Préparer le dossier administratif')).toBeInTheDocument();
    expect(within(dialog).queryByText('Cadrer le besoin avec les services')).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText('Statut de Préparer le dossier administratif')).toBeEnabled();
    expect(within(dialog).getByLabelText(/Titre/)).toBeDisabled();
  });

  it('filters tasks, updates task status, comments and records history', () => {
    const handleUpdateProject = jest.fn();
    render(<ProjectModule onUpdateProject={handleUpdateProject} />);

    fireEvent.click(screen.getByRole('button', { name: 'Actions pour Aménagement du parc central' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Ouvrir' }));

    const dialog = screen.getByRole('dialog', { name: 'Modifier le projet' });
    fireEvent.change(within(dialog).getByPlaceholderText('Rechercher une tâche...'), {
      target: { value: 'budget' },
    });

    expect(within(dialog).getByText('Valider le budget prévisionnel')).toBeInTheDocument();
    expect(within(dialog).queryByText('Consulter les prestataires')).not.toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Statut de Valider le budget prévisionnel'), {
      target: { value: 'in-progress' },
    });
    fireEvent.change(within(dialog).getByLabelText('Commenter Valider le budget prévisionnel'), {
      target: { value: 'Budget revu avec les finances.' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Commenter' }));

    expect(within(dialog).getByText('Budget revu avec les finances.')).toBeInTheDocument();
    expect(within(dialog).getByText('Historique des modifications')).toBeInTheDocument();
    expect(within(dialog).getByText('Commentaire ajouté : Valider le budget prévisionnel')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }));

    expect(handleUpdateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'central-park',
        tasks: expect.arrayContaining([
          expect.objectContaining({
            title: 'Valider le budget prévisionnel',
            status: 'in-progress',
            comments: expect.arrayContaining([
              expect.objectContaining({ message: 'Budget revu avec les finances.' }),
            ]),
          }),
        ]),
      })
    );
  });

  it('closes a project from the action menu', () => {
    const handleUpdateProject = jest.fn();
    render(<ProjectModule onUpdateProject={handleUpdateProject} />);

    fireEvent.click(screen.getByRole('button', { name: 'Actions pour Aménagement du parc central' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Clôturer' }));

    expect(handleUpdateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'central-park',
        status: 'done',
        progress: 100,
      })
    );
    expect(screen.getByRole('status')).toHaveTextContent('Projet "Aménagement du parc central" clôturé.');
  });

  it('shows project settings feedback', () => {
    const handleSettingsClick = jest.fn();
    render(<ProjectModule onSettingsClick={handleSettingsClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Paramètres' }));

    expect(handleSettingsClick).toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Paramètres en cours de développement.');
  });
});
