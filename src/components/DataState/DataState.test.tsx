import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DataState } from './DataState';

it('names an empty region, defaults its French text and delegates its create action without focusing it', async () => {
  const user = userEvent.setup(); const create = jest.fn();
  const { container, rerender } = render(<DataState state="empty" onCreate={create} createLabel="Créer un dossier" />);
  expect(screen.getByRole('region', { name: 'Aucun élément à afficher.' })).toHaveTextContent('Les éléments apparaîtront ici dès qu’ils seront créés.');
  expect(create).not.toHaveBeenCalled(); expect(document.body).toHaveFocus();
  await user.tab(); await user.keyboard('{Enter}'); expect(create).toHaveBeenCalledTimes(1);
  expect((await axe(container)).violations).toEqual([]);
  const retry = jest.fn();
  rerender(<DataState state="unavailable" title="Calendrier indisponible" onRetry={retry} />);
  await user.click(screen.getByRole('button', { name: 'Réessayer' })); expect(retry).toHaveBeenCalledTimes(1);
  rerender(<DataState state="error" onRetry={retry} />);
  expect(screen.getByRole('region', { name: 'Une erreur est survenue.' })).toBeInTheDocument();
  rerender(<DataState state="loading" title="Chargement des projets" />);
  expect(screen.getByRole('status')).toHaveTextContent('Chargement des projets');
  expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
});

describe('MAIR-1098 DataState', () => {
  it('illustrates the empty state at m and l, keeps the icon at s', () => {
    const { container, rerender } = render(<DataState state="empty" />);
    expect(container.querySelector('[data-illustration="empty"]')).not.toBeNull();
    rerender(<DataState state="empty" size="l" />);
    expect(container.querySelector('[data-illustration="empty"]')).toHaveAttribute('width', '176');
    rerender(<DataState state="empty" size="s" />);
    expect(container.querySelector('[data-illustration="empty"]')).toBeNull();
    expect(container.querySelector('svg.mairie-icon')).not.toBeNull();
    rerender(<DataState state="error" size="l" />);
    expect(container.querySelector('[data-illustration="empty"]')).toBeNull();
  });

  it('loads with three rising dots instead of a skeleton', async () => {
    const { container } = render(<DataState state="loading" />);
    expect(container.querySelectorAll('.mairie-loading-dot')).toHaveLength(3);
    expect(container.querySelector('.mairie-skeleton')).toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });
});
