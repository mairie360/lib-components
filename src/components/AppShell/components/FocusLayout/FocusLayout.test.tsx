import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';

import { FocusLayout } from './FocusLayout';

describe('FocusLayout (MAIR-1139)', () => {
  it('folds the table of contents behind a « Sommaire » disclosure button', () => {
    const { container } = render(<FocusLayout bar={<span>Barre</span>} aside={<a href="#a">Section A</a>}><p>Contenu</p></FocusLayout>);
    const toggle = screen.getByRole('button', { name: 'Sommaire' });
    const nav = screen.getByRole('navigation', { name: 'Sommaire' });
    expect(toggle).toHaveAttribute('aria-controls', nav.id);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(container.firstElementChild).toHaveAttribute('data-aside-open', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(container.firstElementChild).toHaveAttribute('data-aside-open', 'true');
    expect(container.firstElementChild).toHaveClass('app-focus-shell', 'app-focus-shell-with-aside');
  });

  it('names the table of contents with asideLabel', () => {
    render(<FocusLayout aside={<p>Plan</p>} asideLabel="Étapes"><p>Contenu</p></FocusLayout>);
    expect(screen.getByRole('navigation', { name: 'Étapes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Étapes' })).toBeInTheDocument();
  });

  it('puts the slots in their regions: bar, single main and sticky actions', () => {
    const { container } = render(<FocusLayout bar={<span>Barre</span>} footer={<button type="button">Valider</button>}><p>Contenu</p></FocusLayout>);
    expect(screen.getByRole('banner')).toHaveClass('app-focus-bar');
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('main')).toHaveClass('app-focus-content');
    expect(screen.getByRole('button', { name: 'Valider' }).parentElement).toHaveClass('app-focus-footer');
    expect(container.firstElementChild).not.toHaveClass('app-focus-shell-with-aside');
  });

  it('offers the skip link to the main content', () => {
    render(<FocusLayout><p>Contenu</p></FocusLayout>);
    const skip = screen.getByRole('link', { name: 'Aller au contenu' });
    fireEvent.click(skip);
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('has no axe violation', async () => {
    const { container } = render(<FocusLayout bar={<h1>Dossier</h1>} aside={<a href="#a">Section A</a>} footer={<button type="button">Valider</button>}><p>Contenu</p></FocusLayout>);
    expect((await axe(container)).violations).toEqual([]);
  });
});
