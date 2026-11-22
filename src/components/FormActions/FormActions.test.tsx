import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { FormActions } from './FormActions';

describe('FormActions (MAIR-608)', () => {
  it('renders the status, the cancel and the save actions and locks them while busy', async () => {
    const user = userEvent.setup(); const onCancel = jest.fn();
    const { rerender } = render(<FormActions status="Aucune modification à enregistrer." onCancel={onCancel} saveDisabled />);
    expect(screen.getByRole('status')).toHaveTextContent('Aucune modification à enregistrer.');
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Annuler' })); expect(onCancel).toHaveBeenCalledTimes(1);
    rerender(<FormActions busy onCancel={onCancel} />);
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
  });

  describe('MAIR-1118 dirty and sticky', () => {
    it('disables both buttons and says there is nothing to save when clean', async () => {
      const { container } = render(<FormActions dirty={false} onCancel={jest.fn()} />);
      expect(screen.getByRole('status')).toHaveTextContent('Aucune modification à enregistrer.');
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
      expect(container.firstElementChild).toHaveAttribute('data-dirty', 'false');
      expect((await axe(container)).violations).toEqual([]);
    });

    it('stands out with enabled buttons and a free status when dirty', () => {
      const { container } = render(<FormActions dirty status="2 champs modifiés." onCancel={jest.fn()} />);
      const bar = container.firstElementChild as HTMLElement;
      expect(bar).toHaveClass('bg-[var(--mairie-accent-surface)]', 'border-[var(--mairie-accent)]');
      expect(bar.style.borderRadius).toBe('var(--mairie-radius-m)');
      expect(bar.style.padding).toBe('12px 16px');
      expect(bar.style.transitionDuration).toBe('var(--mairie-motion-fast)');
      expect(screen.getByRole('status')).toHaveTextContent('2 champs modifiés.');
      expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Annuler' })).toBeEnabled();
    });

    it('sticks to the bottom with sticky and keeps the former look without dirty', () => {
      const { container, rerender } = render(<FormActions sticky />);
      expect(container.firstElementChild).toHaveClass('sticky', 'bottom-0', 'bg-[var(--mairie-surface)]');
      rerender(<FormActions />);
      const bar = container.firstElementChild as HTMLElement;
      expect(bar).toHaveClass('border-t');
      expect(bar).not.toHaveAttribute('data-dirty');
      expect(screen.queryByRole('status')).toBeNull();
      expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeEnabled();
    });
  });
});
