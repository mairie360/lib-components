import { fireEvent, render, screen } from '@testing-library/react';
import { Calendar } from 'lucide-react';
import '@testing-library/jest-dom';

import { Button } from './Button';
import { ButtonPresets, CancelButton, ConfirmDeleteButton, CreateButton, DeleteButton, SaveButton } from '../ButtonPresets';
import { IconButton } from '../IconButton';
import { LinkButton } from '../LinkButton';
import { sizes, tones } from '../../kit/theme';

describe('Button (MAIR-608)', () => {
  it('renders a solid primary medium button by default and reports the click', () => {
    const onClick = jest.fn();
    render(<Button label="Créer" onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Créer' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'solid');
    expect(button).toHaveAttribute('data-tone', 'primary');
    expect(button).toHaveAttribute('data-size', 'm');
    expect(button.style.height).toBe('var(--mairie-control-m)');
    expect(button.style.fontSize).toBe('var(--mairie-text-m)');
    expect(button.className).toContain('bg-[var(--mairie-action-background)]');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each(sizes)('binds the %s size to the control and text tokens', (size) => {
    render(<Button label={size} size={size} icon={Calendar} />);
    const button = screen.getByRole('button', { name: size });
    expect(button.style.height).toBe(`var(--mairie-control-${size})`);
    expect(button.querySelector('svg')!.style.width).toBe(`var(--mairie-icon-${size})`);
  });

  it.each(tones)('accepts the %s tone on every variant', (tone) => {
    for (const variant of ['solid', 'outline', 'ghost', 'link'] as const) {
      const { unmount } = render(<Button label={`${variant} ${tone}`} variant={variant} tone={tone} />);
      const button = screen.getByRole('button', { name: `${variant} ${tone}` });
      expect(button).toHaveAttribute('data-variant', variant);
      expect(button).toHaveAttribute('data-tone', tone);
      if (variant !== 'solid') expect(button.style.color).toContain('var(--mairie-');
      unmount();
    }
  });

  it('disables itself and announces aria-busy while loading, with a spinner instead of the icon', () => {
    render(<Button label="Enregistrer" icon={Calendar} loading />);
    const button = screen.getByRole('button', { name: 'Enregistrer' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('svg')).toBeNull();
    expect(button.querySelector('.animate-spin')).not.toBeNull();
  });

  it('places the icon after the text when asked and keeps rich children', () => {
    render(<Button icon={Calendar} iconPosition="end"><em>Rich</em></Button>);
    const button = screen.getByRole('button', { name: 'Rich' });
    expect(button.lastElementChild!.tagName.toLowerCase()).toBe('svg');
  });
});

describe('Button presets (MAIR-608)', () => {
  it.each([
    [CreateButton, 'Créer', 'solid', 'primary'],
    [SaveButton, 'Enregistrer', 'solid', 'primary'],
    [CancelButton, 'Annuler', 'outline', 'neutral'],
    [DeleteButton, 'Supprimer', 'outline', 'danger'],
    [ConfirmDeleteButton, 'Confirmer la suppression', 'solid', 'danger'],
  ] as const)('%p renders "%s" as %s %s', (Preset, label, variant, tone) => {
    render(<Preset />);
    const button = screen.getByRole('button', { name: label });
    expect(button).toHaveAttribute('data-variant', variant);
    expect(button).toHaveAttribute('data-tone', tone);
  });

  it('lets a consumer override the label, size and loading state', () => {
    render(<SaveButton label="Enregistrer le profil" size="l" loading />);
    const button = screen.getByRole('button', { name: 'Enregistrer le profil' });
    expect(button).toHaveAttribute('data-size', 'l');
    expect(button).toBeDisabled();
  });

  it('exposes every preset by role name', () => {
    expect(Object.keys(ButtonPresets).sort()).toEqual(['back', 'cancel', 'close', 'confirmDelete', 'create', 'delete', 'download', 'edit', 'logout', 'refresh', 'retry', 'save', 'send']);
  });
});

describe('IconButton (MAIR-608)', () => {
  it('renders a square ghost button named by its preset', () => {
    render(<IconButton preset="delete" size="s" />);
    const button = screen.getByRole('button', { name: 'Supprimer' });
    expect(button).toHaveAttribute('data-tone', 'danger');
    expect(button.style.width).toBe('var(--mairie-control-s)');
    expect(button.style.height).toBe('var(--mairie-control-s)');
    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('requires an accessible name without a preset and supports a pressed state', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() => render(<IconButton icon={Calendar} />)).toThrow(/label/);
    } finally {
      error.mockRestore();
    }
    render(<IconButton icon={Calendar} label="Calendrier" pressed />);
    expect(screen.getByRole('button', { name: 'Calendrier' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('LinkButton (MAIR-608)', () => {
  it('renders an anchor with an href and a button without', () => {
    render(<><LinkButton href="/aide" label="Centre d’aide" /><LinkButton label="Voir tout" onClick={() => undefined} /></>);
    expect(screen.getByRole('link', { name: 'Centre d’aide' })).toHaveAttribute('data-content', 'text');
    expect(screen.getByRole('button', { name: 'Voir tout' })).toHaveAttribute('data-tone', 'primary');
  });

  it('supports icon-only and image contents', () => {
    render(<><LinkButton icon={Calendar} iconOnly label="Ouvrir le calendrier" href="/calendrier" /><LinkButton href="/doc" image={{ src: '/doc.png', alt: 'Aperçu du document' }} label="Document" /></>);
    expect(screen.getByRole('link', { name: 'Ouvrir le calendrier' })).toHaveAttribute('data-content', 'icon');
    const image = screen.getByRole('link', { name: /Aperçu du document/ });
    expect(image).toHaveAttribute('data-content', 'image');
    expect(image.querySelector('img')).toHaveAttribute('src', '/doc.png');
  });
});
