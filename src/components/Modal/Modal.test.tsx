import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { EmailField } from '../FieldPresets';
import { Modal } from './Modal';

function Host({ size = 'm' }: { size?: 'm' | 'l' }) {
  const [open, setOpen] = React.useState(false);
  return <>
    <button onClick={() => setOpen(true)}>Ouvrir</button>
    <Modal open={open} title="Nouveau projet" size={size} onClose={() => setOpen(false)} footer={<button onClick={() => setOpen(false)}>Enregistrer</button>}>
      <EmailField />
    </Modal>
  </>;
}

describe('Modal (MAIR-608)', () => {
  it('traps focus, closes on Escape and the backdrop, and restores focus to the opener', async () => {
    const user = userEvent.setup();
    const { container } = render(<Host size="l" />);
    await user.click(screen.getByRole('button', { name: 'Ouvrir' }));
    const dialog = screen.getByRole('dialog', { name: 'Nouveau projet' });
    expect(dialog).toHaveAttribute('aria-modal', 'true'); expect(dialog).toHaveAttribute('data-size', 'l'); expect(dialog.style.maxWidth).toBe('800px');
    expect(screen.getByRole('button', { name: 'Fermer la fenêtre' })).toHaveFocus();
    await user.tab(); expect(screen.getByLabelText('Adresse e-mail')).toHaveFocus();
    await user.tab(); expect(screen.getByRole('button', { name: 'Enregistrer' })).toHaveFocus();
    await user.tab(); expect(screen.getByRole('button', { name: 'Fermer la fenêtre' })).toHaveFocus();
    await user.tab({ shift: true }); expect(screen.getByRole('button', { name: 'Enregistrer' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    expect((await axe(container)).violations).toEqual([]);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Ouvrir' })).toHaveFocus(); expect(document.body.style.overflow).toBe('');
    await user.click(screen.getByRole('button', { name: 'Ouvrir' }));
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement!); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('keeps focus in a field of a modal whose parent re-renders on every keystroke (CodeRabbit on #467)', async () => {
    const user = userEvent.setup();
    function Typing() {
      const [value, setValue] = React.useState('');
      return <Modal open title="Nom du projet" onClose={() => undefined}><label htmlFor="name">Nom</label><input id="name" value={value} onChange={(event) => setValue(event.target.value)} /></Modal>;
    }
    render(<Typing />);
    await user.click(screen.getByLabelText('Nom'));
    await user.keyboard('Voirie');
    expect(screen.getByLabelText('Nom')).toHaveFocus();
    expect(screen.getByLabelText('Nom')).toHaveValue('Voirie');
  });
  it('links a description to the dialog and accepts a rich title (MAIR-608 Calendars)', () => {
    render(<Modal open title={<>Détail<span role="status">Enregistrement en cours…</span></>} description="Ajoutez une date au calendrier." onClose={() => undefined}><p>x</p></Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleDescription('Ajoutez une date au calendrier.');
    expect(within(dialog).getByRole('status')).toHaveTextContent('Enregistrement en cours…');
  });
  it('keeps focus in the next dialog and focuses a busy dialog on its panel (Calendars details → editor)', async () => {
    const user = userEvent.setup();
    function Steps() {
      const [step, setStep] = React.useState<'closed' | 'details' | 'editor'>('closed');
      return <>
        <button onClick={() => setStep('details')}>Ouvrir</button>
        {step === 'details' && <Modal open title="Détail" onClose={() => setStep('closed')}><button onClick={() => setStep('editor')}>Modifier</button></Modal>}
        {step === 'editor' && <Modal open title="Éditeur" onClose={() => setStep('closed')}><fieldset disabled><input aria-label="Titre" /><button>Enregistrer</button></fieldset></Modal>}
      </>;
    }
    render(<Steps />);
    await user.click(screen.getByRole('button', { name: 'Ouvrir' }));
    await user.click(screen.getByRole('button', { name: 'Modifier' }));
    const editor = screen.getByRole('dialog', { name: 'Éditeur' });
    expect(editor.contains(document.activeElement)).toBe(true);
    expect(screen.getByRole('button', { name: 'Ouvrir' })).not.toHaveFocus();
  });
  it('leaves Tab and Escape to a dialog nested inside it', () => {
    const close = jest.fn();
    render(<Modal open title="Parent" onClose={close}><button>Action</button><div role="dialog" aria-modal="true" aria-label="Imbriquée"><button>Premier</button><button>Dernier</button></div></Modal>);
    const last = screen.getByRole('button', { name: 'Dernier' });
    last.focus();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    last.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
  });
});

describe('Modal, full-window veil and centred dialog (MAIR-857)', () => {
  it.each([['xs', 360], ['s', 480], ['m', 640], ['l', 800], ['xl', 1040]] as const)('caps the %s size at %i px like Figma Base/Modal', (size, width) => {
    render(<Modal open title="Fiche" size={size} onClose={() => undefined}><p>Contenu</p></Modal>);
    expect(screen.getByRole('dialog', { name: 'Fiche' }).style.maxWidth).toBe(`${width}px`);
  });

  it('covers the whole window with the 35 % overlay token and centres the dialog', () => {
    const close = jest.fn();
    render(<Modal open title="Fiche" onClose={close}><p>Contenu</p></Modal>);
    const veil = screen.getByRole('dialog').parentElement!;
    expect(veil).toHaveClass('fixed', 'inset-0', 'z-50', 'bg-[var(--mairie-overlay-background)]/35', 'items-center', 'justify-center');
    fireEvent.mouseDown(veil);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('can be an alert dialog that keeps the focus trap and Escape', () => {
    const close = jest.fn();
    render(<Modal open role="alertdialog" title="Se déconnecter ?" onClose={close} footer={<button>Annuler</button>}><p>Message</p></Modal>);
    const dialog = screen.getByRole('alertdialog', { name: 'Se déconnecter ?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    fireEvent.keyDown(screen.getByRole('button', { name: 'Annuler' }), { key: 'Tab' });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(1);
  });
});

// MAIR-1131: composable footer and step header.
describe('MAIR-1131 Modal footer slots and steps', () => {
  const steps = [{ label: 'Identité' }, { label: 'Rôle' }, { label: 'Pièces jointes', optional: true }, { label: 'Vérification' }];

  it('places footerStart at the start and footerEnd after footer', () => {
    render(<Modal open title="Nouvel agent" onClose={() => undefined} footerStart={<button type="button">Précédent</button>} footer={<button type="button">Annuler</button>} footerEnd={<button type="button">Suivant</button>}>Contenu</Modal>);
    const footer = screen.getByRole('button', { name: 'Précédent' }).closest('footer')!;
    expect(Array.from(footer.querySelectorAll('button')).map(button => button.textContent)).toEqual(['Précédent', 'Annuler', 'Suivant']);
    expect(screen.getByRole('button', { name: 'Précédent' }).parentElement).toHaveClass('mr-auto');
  });

  it('shows the steps under the title, moves the focus to the title on each change and keeps Escape', async () => {
    const user = userEvent.setup(); const change = jest.fn(); const close = jest.fn();
    const { rerender } = render(<Modal open title="Nouvel agent" onClose={close} steps={steps} currentStep={1} onStepChange={change}>Étape</Modal>);
    const dialog = screen.getByRole('dialog', { name: 'Nouvel agent' });
    expect(dialog).toHaveAccessibleDescription('Rôle Étape 2 sur 4');
    expect(screen.getByRole('button', { name: 'Étape 2 sur 4 : Rôle' })).toHaveAttribute('aria-current', 'step');
    await user.click(screen.getByRole('button', { name: 'Étape 3 sur 4 : Pièces jointes (facultative)' }));
    expect(change).toHaveBeenCalledWith(2);
    rerender(<Modal open title="Nouvel agent" onClose={close} steps={steps} currentStep={2} onStepChange={change}>Étape</Modal>);
    expect(screen.getByRole('heading', { name: 'Nouvel agent' })).toHaveFocus();
    expect(dialog).toHaveTextContent('Pièces jointes (facultative)Étape 3 sur 4');
    expect(dialog.querySelector('.mairie-scroll-hidden')).not.toBeNull();
    await user.keyboard('{Escape}');
    expect(close).toHaveBeenCalledTimes(1);
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('has no step header nor footer without them', () => {
    render(<Modal open title="Simple" onClose={() => undefined}>Contenu</Modal>);
    expect(document.querySelector('[data-modal-steps]')).toBeNull();
    expect(document.querySelector('footer')).toBeNull();
  });
});
