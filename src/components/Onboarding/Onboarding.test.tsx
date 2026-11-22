import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { Onboarding, onboardingSlides } from './Onboarding';

// MAIR-1097: Figma `Onboarding`, the tour of Mairie360 in five slides.
describe('MAIR-1097 Onboarding', () => {
  it('has the five slides of the tour', () => {
    expect(onboardingSlides.map(slide => slide.title)).toEqual(['Bienvenue dans Mairie360', 'Tableau de bord', 'Projets et calendrier', 'Restez informé', 'Formez-vous à votre rythme']);
  });

  it('moves with Suivant, Précédent, the steps and the arrow keys, and ends on Commencer', async () => {
    const user = userEvent.setup(); const done = jest.fn();
    const { container } = render(<Onboarding onDone={done} />);
    const region = screen.getByRole('region', { name: 'Bienvenue dans Mairie360' });
    expect(region).toHaveAttribute('aria-roledescription', 'carrousel');
    expect(screen.getByText('Étape 1 sur 5')).toBeInTheDocument();
    // Hidden, not removed: the footer keeps its layout.
    expect(screen.queryByRole('button', { name: 'Précédent' })).toBeNull();
    expect(screen.getByText('Précédent').closest('button')).toHaveStyle({ visibility: 'hidden' });
    expect(container.querySelector('[data-logo-intro="animated"]')).not.toBeNull();
    expect((await axe(container)).violations).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByRole('heading', { name: 'Tableau de bord' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Étape 2 sur 5/ })).toHaveAttribute('aria-current', 'step');
    await user.click(screen.getByRole('button', { name: 'Précédent' }));
    // The logo intro is one-shot.
    expect(container.querySelector('[data-logo-intro="static"]')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: /^Étape 4 sur 5/ }));
    expect(screen.getByRole('heading', { name: 'Restez informé' })).toBeInTheDocument();
    screen.getByRole('button', { name: 'Suivant' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('heading', { name: 'Formez-vous à votre rythme' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Passer' })).toBeNull();
    await user.keyboard('{ArrowLeft}{ArrowRight}');
    await user.click(screen.getByRole('button', { name: 'Commencer' }));
    expect(done).toHaveBeenCalledWith('done');
  });

  it('skips with Passer or Escape', async () => {
    const user = userEvent.setup(); const done = jest.fn();
    render(<Onboarding onDone={done} />);
    await user.click(screen.getByRole('button', { name: 'Passer' }));
    expect(done).toHaveBeenLastCalledWith('skip');
    // Escape outside the tour does nothing.
    (document.activeElement as HTMLElement).blur();
    await user.keyboard('{Escape}');
    expect(done).toHaveBeenCalledTimes(1);
    screen.getByRole('button', { name: 'Suivant' }).focus();
    await user.keyboard('{Escape}');
    expect(done).toHaveBeenCalledTimes(2);
    expect(done).toHaveBeenLastCalledWith('skip');
  });

  it('moves once per arrow key from the steps', async () => {
    const user = userEvent.setup();
    render(<Onboarding onDone={jest.fn()} />);
    screen.getByRole('button', { name: /^Étape 1 sur 5/ }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('heading', { name: 'Tableau de bord' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Étape 2 sur 5/ })).toHaveFocus();
  });

  it('is a modal dialog with the focus inside, Escape = Passer', async () => {
    const user = userEvent.setup(); const done = jest.fn();
    const { container } = render(<Onboarding modal onDone={done} slides={[{ title: 'Bienvenue', text: 'Présentation.', art: 'dashboard' }, { title: 'Fin', text: 'Bonne journée.' }]} />);
    const dialog = screen.getByRole('dialog', { name: 'Bienvenue' });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(container.firstElementChild).toHaveAttribute('data-m360-component', 'Onboarding');
    expect(container.querySelector('[data-art="dashboard"]')).not.toBeNull();
    await user.keyboard('{Escape}');
    expect(done).toHaveBeenCalledWith('skip');
    expect((await axe(container)).violations).toEqual([]);
  });
});
