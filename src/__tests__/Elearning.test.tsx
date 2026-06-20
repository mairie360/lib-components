import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { ElearningCatalog, type ElearningCourse } from '../components/ElearningCatalog';
import { ElearningCourseCard } from '../components/ElearningCourseCard';
import { ElearningCourseDetailsModal } from '../components/ElearningCourseDetailsModal';
import { ElearningCourseRating } from '../components/ElearningCourseRating';
import { ElearningFilterSelect } from '../components/ElearningFilterSelect';

const courses: ElearningCourse[] = [
  {
    id: 'security',
    category: 'Sécurité',
    statusValue: 'in-progress',
    title: 'Sécurité au travail',
    description: 'Formation sur les règles de sécurité.',
    instructor: 'Catherine Moreau',
    duration: '2h 30min',
    chapters: 8,
    learners: 156,
    statusBadge: { label: 'En cours', variant: 'inProgress' },
  },
  {
    id: 'archives',
    category: 'Administration',
    statusValue: 'completed',
    title: 'Gestion des archives numériques',
    description: 'Organiser les documents numériques.',
    instructor: 'Marc Dubois',
    duration: '1h 45min',
    chapters: 6,
    learners: 89,
    statusBadge: { label: 'Terminé', variant: 'completed' },
  },
];

describe('Elearning components', () => {
  it('opens the filter menu and emits the selected value', () => {
    const handleChange = jest.fn();

    render(
      <ElearningFilterSelect
        defaultValue="all"
        onValueChange={handleChange}
        options={[
          { label: 'Tous les statuts', value: 'all' },
          { label: 'En cours', value: 'in-progress' },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'En cours' }));
    expect(handleChange).toHaveBeenCalledWith('in-progress');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders a course card and calls its action', () => {
    const handleAction = jest.fn();

    render(
      <ElearningCourseCard
        title="Comptabilité publique"
        description="Perfectionnement en comptabilité publique."
        instructor="Pierre Bertrand"
        duration="4h 20min"
        chapters={12}
        learners={45}
        actionLabel="Continuer"
        onAction={handleAction}
      />
    );

    expect(screen.getByRole('heading', { name: 'Comptabilité publique' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('updates the course card action label from progress', () => {
    const { rerender } = render(
      <ElearningCourseCard title="Formation progressive" description="Suivi de progression." progress={0} />
    );

    expect(screen.getByRole('button', { name: 'Commencer' })).toBeInTheDocument();

    rerender(<ElearningCourseCard title="Formation progressive" description="Suivi de progression." progress={50} />);
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();

    rerender(<ElearningCourseCard title="Formation progressive" description="Suivi de progression." progress={100} />);
    expect(screen.getByRole('button', { name: 'Revoir' })).toBeInTheDocument();
  });

  it('renders readable course details with long chapter titles', () => {
    render(
      <ElearningCourseDetailsModal
        open
        title="Comptabilité publique - Niveau avancé"
        description="Perfectionnement en comptabilité publique et gestion budgétaire"
        instructor="Pierre Bertrand"
        duration="4h 20min"
        rating={4.6}
        ratingLabel="(45 étudiants)"
        progress={25}
        chapters={[
          {
            id: 'intro',
            title: 'Introduction à la comptabilité publique et aux grands principes budgétaires',
            duration: '15min',
            completed: true,
          },
        ]}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getAllByText('Introduction à la comptabilité publique et aux grands principes budgétaires').length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Progression totale')).toBeInTheDocument();
  });

  it('closes course details when clicking outside the dialog', () => {
    const handleClose = jest.fn();

    render(
      <ElearningCourseDetailsModal
        open
        onClose={handleClose}
        title="Cours consultable"
        description="Détail de formation."
        chapters={[
          {
            id: 'intro',
            title: 'Introduction',
            duration: '15min',
          },
        ]}
      />
    );

    const dialog = screen.getByRole('dialog');
    const backdrop = dialog.parentElement as HTMLElement;

    fireEvent.mouseDown(dialog);
    expect(handleClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches chapters and renders the selected chapter contents', () => {
    render(
      <ElearningCourseDetailsModal
        open
        title="Cours multi-contenus"
        description="Un cours avec plusieurs chapitres et ressources."
        chapters={[
          {
            id: 'chapter-video',
            title: 'Chapitre vidéo',
            duration: '15min',
            active: true,
            contents: [
              {
                id: 'chapter-video-main',
                title: 'Vidéo principale du chapitre',
                type: 'video',
                duration: '15min',
              },
              {
                id: 'chapter-video-support',
                title: 'Support PDF du chapitre vidéo',
                type: 'pdf',
              },
            ],
          },
          {
            id: 'chapter-documents',
            title: 'Chapitre documents',
            duration: '20min',
            contents: [
              {
                id: 'chapter-documents-guide',
                title: 'Guide documentaire à lire',
                type: 'document',
              },
            ],
          },
        ]}
      />
    );

    expect(screen.getAllByText('Vidéo principale du chapitre').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Chapitre documents/ }));

    expect(screen.getAllByText('Guide documentaire à lire').length).toBeGreaterThan(0);
    expect(screen.queryByText('Support PDF du chapitre vidéo')).not.toBeInTheDocument();
  });

  it('updates progress and emits onContentComplete when completing course contents', () => {
    const handleContentComplete = jest.fn();

    render(
      <ElearningCourseDetailsModal
        open
        title="Cours avec progression"
        description="Un cours dont la progression se met à jour."
        progress={0}
        onContentComplete={handleContentComplete}
        chapters={[
          {
            id: 'progress-chapter',
            title: 'Chapitre à compléter',
            duration: '30min',
            active: true,
            contents: [
              {
                id: 'progress-video',
                title: 'Vidéo de progression',
                type: 'video',
              },
              {
                id: 'progress-document',
                title: 'Document de progression',
                type: 'pdf',
              },
            ],
          },
        ]}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Marquer Vidéo de progression comme terminé' }));

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(handleContentComplete).toHaveBeenLastCalledWith(
      expect.objectContaining({
        progress: 50,
        completed: false,
        completedRequiredContents: 1,
        totalRequiredContents: 2,
        content: expect.objectContaining({ id: 'progress-video', completed: true }),
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Marquer Document de progression comme terminé' }));

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(handleContentComplete).toHaveBeenLastCalledWith(
      expect.objectContaining({
        progress: 100,
        completed: true,
        completedRequiredContents: 2,
        totalRequiredContents: 2,
        chapter: expect.objectContaining({ id: 'progress-chapter', completed: true }),
      })
    );
  });

  it('lets users rate a completed course', () => {
    const handleSubmit = jest.fn();

    render(<ElearningCourseRating onSubmit={handleSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Donner la note 5 sur 5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer la note' }));

    expect(handleSubmit).toHaveBeenCalledWith(5);
    expect(screen.getByText('Merci, votre note a bien été enregistrée.')).toBeInTheDocument();
  });

  it('shows course rating only when course details are completed', () => {
    const { rerender } = render(
      <ElearningCourseDetailsModal
        open
        title="Cours en cours"
        description="Formation pas encore terminée."
        progress={75}
        chapters={[
          {
            id: 'chapter-active',
            title: 'Chapitre actif',
            duration: '15min',
            active: true,
          },
        ]}
      />
    );

    expect(screen.queryByText('Noter cette formation')).not.toBeInTheDocument();

    rerender(
      <ElearningCourseDetailsModal
        open
        title="Cours terminé"
        description="Formation terminée."
        progress={100}
        chapters={[
          {
            id: 'chapter-completed',
            title: 'Chapitre terminé',
            duration: '15min',
            completed: true,
          },
        ]}
      />
    );

    expect(screen.getByText('Noter cette formation')).toBeInTheDocument();
  });

  it('updates the displayed course rating after submitting a rating', () => {
    render(
      <ElearningCourseDetailsModal
        open
        title="Cours terminé"
        description="Formation terminée."
        rating={3}
        ratingLabel="(12 apprenants)"
        ratingDistribution={{ 1: 0, 2: 0, 3: 12, 4: 0, 5: 0 }}
        progress={100}
        chapters={[
          {
            id: 'chapter-completed',
            title: 'Chapitre terminé',
            duration: '15min',
            completed: true,
          },
        ]}
      />
    );

    expect(screen.getByText('3 (12 notes)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Donner la note 5 sur 5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer la note' }));

    expect(screen.getByText('3.2 (13 notes)')).toBeInTheDocument();
    expect(screen.queryByText('3 (12 notes)')).not.toBeInTheDocument();
  });

  it('updates the catalog card rating after submitting a course rating', () => {
    const handleCourseRatingSubmit = jest.fn();

    render(
      <ElearningCatalog
        courses={[
          {
            ...courses[1],
            rating: 2.5,
            ratingDistribution: { 1: 0, 2: 1, 3: 1, 4: 0, 5: 0 },
            progress: 100,
            actionLabel: 'Revoir',
          },
        ]}
        onCourseRatingSubmit={handleCourseRatingSubmit}
      />
    );

    expect(within(screen.getByRole('article')).getByText('2.5')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Revoir' }));
    fireEvent.click(screen.getByRole('button', { name: 'Donner la note 4 sur 5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer la note' }));
    fireEvent.click(screen.getByLabelText('Fermer le détail du cours'));

    expect(handleCourseRatingSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'archives' }),
      4,
      expect.objectContaining({ rating: 3, ratingCount: 3 })
    );
    expect(within(screen.getByRole('article')).getByText('3')).toBeInTheDocument();
    expect(within(screen.getByRole('article')).queryByText('2.5')).not.toBeInTheDocument();
  });

  it('updates the catalog card progress after completing a course content', () => {
    const handleCourseContentComplete = jest.fn();

    render(
      <ElearningCatalog
        courses={[
          {
            ...courses[0],
            progress: 0,
            chapters: 1,
            actionLabel: 'Continuer',
          },
        ]}
        onCourseContentComplete={handleCourseContentComplete}
      />
    );

    expect(within(screen.getByRole('article')).getByText('0%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Commencer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Marquer Vidéo du chapitre 1 comme terminé' }));
    fireEvent.click(screen.getByLabelText('Fermer le détail du cours'));

    expect(handleCourseContentComplete).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'security' }),
      expect.objectContaining({ progress: 50 })
    );
    expect(within(screen.getByRole('article')).getByText('50%')).toBeInTheDocument();
    expect(within(screen.getByRole('article')).getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('opens course details from catalog when a course provides details', () => {
    render(
      <ElearningCatalog
        courses={[
          {
            ...courses[0],
            details: {
              title: 'Sécurité au travail',
              description: 'Formation sur les règles de sécurité.',
              instructor: 'Catherine Moreau',
              duration: '2h 30min',
              progress: 72,
              chapters: [
                {
                  id: 'safety',
                  title: 'Règles de sécurité à respecter dans les bâtiments municipaux',
                  duration: '15min',
                  completed: true,
                },
              ],
            },
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Règles de sécurité à respecter dans les bâtiments municipaux');
  });

  it('opens fallback course details from catalog when details are not provided', () => {
    render(<ElearningCatalog courses={[courses[1]]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Gestion des archives numériques');
    expect(screen.getByRole('dialog')).toHaveTextContent('Chapitre 1');
    expect(screen.getByRole('dialog')).toHaveTextContent('Support du chapitre 1');
    expect(screen.getByRole('dialog')).toHaveTextContent('Noter cette formation');
  });

  it('filters catalog courses by category and search', () => {
    render(<ElearningCatalog courses={courses} certificationCount={3} />);

    expect(screen.queryByText('3 certifications obtenues')).not.toBeInTheDocument();
    expect(screen.getByText('Sécurité au travail')).toBeInTheDocument();
    expect(screen.getByText('Gestion des archives numériques')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Toutes les catégories' }));
    fireEvent.click(screen.getByRole('option', { name: 'Sécurité' }));

    expect(screen.getByText('Sécurité au travail')).toBeInTheDocument();
    expect(screen.queryByText('Gestion des archives numériques')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Rechercher une formation...'), {
      target: { value: 'archives' },
    });

    expect(screen.getByText('Aucune formation ne correspond aux filtres.')).toBeInTheDocument();
  });
});
