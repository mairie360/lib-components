import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { StepProgress, stepProgressSteps } from './StepProgress';

// MAIR-1097: Figma `Base/StepProgress`, rounded dashes filled up to the current step.
describe('MAIR-1097 StepProgress', () => {
  it('lists any number of steps and marks the current one', async () => {
    const { container } = render(<StepProgress steps={['Identité', 'Rôle', 'Accès']} current={1} />);
    const list = screen.getByRole('list', { name: 'Progression' });
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).toHaveTextContent('Étape 1 sur 3 : Identité, terminée');
    expect(items.map(item => item.dataset.state)).toEqual(['done', 'current', 'upcoming']);
    expect(list.querySelectorAll('button')).toHaveLength(0);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('builds default names from a count and keeps the optional flag', () => {
    expect(stepProgressSteps(2)).toEqual([{ label: 'Étape 1' }, { label: 'Étape 2' }]);
    render(<StepProgress steps={[{ label: 'Pièces jointes', optional: true }]} current={0} />);
    expect(screen.getByRole('listitem')).toHaveTextContent('Étape 1 sur 1 : Pièces jointes (facultative)');
  });

  it('is clickable with onStepChange and moves with the arrow keys', async () => {
    const user = userEvent.setup(); const change = jest.fn();
    const { rerender, container } = render(<StepProgress steps={5} current={0} onStepChange={change} />);
    await user.click(screen.getByRole('button', { name: 'Étape 3 sur 5 : Étape 3' }));
    expect(change).toHaveBeenLastCalledWith(2);
    const current = screen.getByRole('button', { name: 'Étape 1 sur 5 : Étape 1' });
    expect(current).toHaveAttribute('aria-current', 'step');
    expect(current).toHaveAttribute('tabindex', '0');
    current.focus();
    await user.keyboard('{ArrowRight}');
    expect(change).toHaveBeenLastCalledWith(1);
    rerender(<StepProgress steps={5} current={1} onStepChange={change} />);
    expect(screen.getByRole('button', { name: 'Étape 2 sur 5 : Étape 2' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(change).toHaveBeenLastCalledWith(4);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('fills with the accent or a module colour, at two heights', () => {
    const { container, rerender } = render(<StepProgress steps={2} current={0} />);
    const fill = () => container.querySelector<HTMLElement>('[data-fill]')!;
    expect(fill().style.background).toBe('var(--mairie-accent)');
    rerender(<StepProgress steps={2} current={0} tone="training" size="s" />);
    expect(fill().style.background).toBe('var(--mairie-module-training)');
    expect((fill().parentElement as HTMLElement).style.height).toBe('4px');
  });
});
