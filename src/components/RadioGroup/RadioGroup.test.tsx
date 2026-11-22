import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyRound, Smartphone } from 'lucide-react';
import { axe } from 'jest-axe';
import { RadioGroup } from './RadioGroup';

describe('RadioGroup (MAIR-608)', () => {
  it('renders a named group and reports the chosen option', async () => {
    const user = userEvent.setup(); const onTheme = jest.fn();
    render(<RadioGroup label="Thème" name="theme" options={[{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }]} defaultValue="light" onChange={onTheme} />);
    expect(screen.getByRole('group', { name: 'Thème' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Sombre' }));
    expect(onTheme).toHaveBeenCalledWith('dark');
    expect(screen.getByRole('radio', { name: 'Sombre' })).toBeChecked();
  });

  // MAIR-1073: Figma `Base/RadioGroup/Card`.
  describe('MAIR-1073 card variant', () => {
    const options = [
      { value: 'passkey', label: 'Clé d’accès (passkey)', hint: 'Utilisez votre empreinte ou votre visage.', icon: KeyRound, badge: 'Recommandé' },
      { value: 'totp', label: 'Application d’authentification', hint: 'Un code à 6 chiffres.', icon: Smartphone },
    ];

    it('renders each option as a card with icon, badge and help text, still a native radio group', () => {
      const { container } = render(<RadioGroup variant="card" label="Méthode" name="method" options={options} defaultValue="passkey" />);
      expect(container.querySelector('fieldset')).toHaveAttribute('data-variant', 'card');
      expect(container.querySelectorAll('label[data-card="true"]')).toHaveLength(2);
      expect(screen.getByRole('radio', { name: /Clé d’accès \(passkey\)/ })).toBeChecked();
      expect(screen.getByText('Recommandé')).toBeInTheDocument();
      expect(screen.getByText('Un code à 6 chiffres.')).toBeInTheDocument();
      expect(container.querySelectorAll('label svg')).toHaveLength(2);
      expect(screen.getAllByText('Recommandé')).toHaveLength(1);
    });

    it('marks the selected card through the checked radio (accent border) and follows the choice', async () => {
      const user = userEvent.setup(); const onChange = jest.fn();
      const { container } = render(<RadioGroup variant="card" label="Méthode" name="method" options={options} defaultValue="passkey" onChange={onChange} />);
      const cards = container.querySelectorAll('label[data-card="true"]');
      expect(cards[0].className).toContain('has-[:checked]:border-[var(--mairie-accent)]');
      await user.click(screen.getByRole('radio', { name: /Application d’authentification/ }));
      expect(onChange).toHaveBeenCalledWith('totp');
      expect(screen.getByRole('radio', { name: /Application d’authentification/ })).toBeChecked();
    });

    it('keeps the default variant unchanged and has no accessibility violation', async () => {
      const { container } = render(<><RadioGroup label="Thème" name="theme" options={[{ value: 'a', label: 'A' }]} /><RadioGroup variant="card" label="Méthode" name="method" options={options} defaultValue="passkey" /></>);
      expect(container.querySelectorAll('label[data-card]')).toHaveLength(2);
      expect(container.querySelector('fieldset[data-variant="default"]')).not.toBeNull();
      expect((await axe(container)).violations).toEqual([]);
    });
  });

  describe('MAIR-1132 card leading and footer', () => {
    it('puts a leading avatar in place of the icon and a footer under the hint', async () => {
      const user = userEvent.setup(); const change = jest.fn();
      const { container } = render(
        <RadioGroup label="Responsable" name="owner" variant="card" onChange={change} options={[
          { value: 'camille', label: 'Camille Martin', icon: KeyRound, leading: <span data-testid="avatar">CM</span>, hint: 'Urbanisme', footer: <span>Charge : 60 %</span> },
          { value: 'leo', label: 'Léo Roux', icon: Smartphone },
        ]} />,
      );
      const camille = screen.getByRole('radio', { name: /Camille Martin/ });
      const card = camille.closest('label')!;
      expect(card.querySelector('[data-leading]')).toContainElement(screen.getByTestId('avatar'));
      expect(card.querySelector('[data-leading]')).toHaveClass('mairie-radio-leading');
      // The leading node replaces the icon.
      expect(card.querySelectorAll('svg')).toHaveLength(0);
      expect(card.querySelector('[data-card-footer]')).toHaveTextContent('Charge : 60 %');
      expect(screen.getByRole('radio', { name: 'Léo Roux' }).closest('label')!.querySelectorAll('svg')).toHaveLength(1);
      await user.click(camille);
      expect(change).toHaveBeenCalledWith('camille');
      await user.keyboard('{ArrowDown}');
      expect(change).toHaveBeenLastCalledWith('leo');
      expect((await axe(container)).violations).toEqual([]);
    });
  });
});
