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
    expect(dialog).toHaveAttribute('aria-modal', 'true'); expect(dialog).toHaveAttribute('data-size', 'l'); expect(dialog.style.maxWidth).toBe('720px');
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
