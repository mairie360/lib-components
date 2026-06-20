import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { ElearningCatalog, type ElearningCourse } from '../components/ElearningCatalog';
import { ElearningCourseCard } from '../components/ElearningCourseCard';
import { ElearningCourseDetailsModal } from '../components/ElearningCourseDetailsModal';
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
  });

  it('filters catalog courses by category and search', () => {
    render(<ElearningCatalog courses={courses} certificationCount={3} />);

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
