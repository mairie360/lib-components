import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { ElearningCatalog, type ElearningCourse } from '../components/ElearningCatalog';
import { ElearningCourseCard } from '../components/ElearningCourseCard';
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
