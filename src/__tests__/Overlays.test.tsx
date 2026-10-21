import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { Alert, AlertPresets, ErrorAlert, UnavailableAlert, WarningAlert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Drawer } from '../components/Drawer';
import { EmailField } from '../components/FieldPresets';

describe('Alert (MAIR-608, Figma Base/Alert + presets)', () => {
  it('announces danger alerts assertively, others as status, with action and dismiss', async () => {
    const user = userEvent.setup(); const action = jest.fn(); const dismiss = jest.fn();
    const { container, rerender } = render(<Alert tone="danger" size="l" title="Échec de l’enregistrement" description="Réessayez." actionLabel="Réessayer" onAction={action} onDismiss={dismiss} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('data-tone', 'danger'); expect(alert).toHaveAttribute('data-size', 'l'); expect(alert).toHaveTextContent('Réessayez.');
    await user.click(screen.getByRole('button', { name: 'Réessayer' })); expect(action).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Fermer le message' })); expect(dismiss).toHaveBeenCalledTimes(1);
    expect((await axe(container)).violations).toEqual([]);
    rerender(<Alert tone="warning" role="alert" title="Action à vérifier" />);
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'warning');
    rerender(<Alert tone="success" title="Enregistré" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-tone', 'success'); expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('ships the five Figma presets with their default French text', () => {
    const retry = jest.fn();
    render(<><ErrorAlert /><WarningAlert title="Suppression définitive" /><UnavailableAlert onAction={retry} /></>);
    expect(screen.getByRole('alert')).toHaveTextContent('Une erreur est survenue.');
    expect(screen.getByText('Suppression définitive').closest('[role="status"]')).toHaveAttribute('data-preset', 'Warning');
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' })); expect(retry).toHaveBeenCalled();
    expect(Object.keys(AlertPresets)).toEqual(['error', 'warning', 'info', 'success', 'unavailable']);
  });
});

describe('Modal, ConfirmModal, Drawer', () => {
  function Host({ size = 'm' }: { size?: 'm' | 'l' }) {
    const [open, setOpen] = React.useState(false);
    return <>
      <button onClick={() => setOpen(true)}>Ouvrir</button>
      <Modal open={open} title="Nouveau projet" size={size} onClose={() => setOpen(false)} footer={<button onClick={() => setOpen(false)}>Enregistrer</button>}>
        <EmailField />
      </Modal>
    </>;
  }
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
  it('confirms a destructive action with the preset buttons and keeps the legacy isOpen prop', async () => {
    const user = userEvent.setup(); const confirm = jest.fn(); const cancel = jest.fn();
    const { rerender } = render(<ConfirmModal isOpen title="Supprimer le projet ?" message="Cette action est irréversible." onConfirm={confirm} onCancel={cancel} />);
    const dialog = screen.getByRole('dialog', { name: 'Supprimer le projet ?' });
    expect(dialog).toHaveAttribute('data-size', 'xs'); expect(within(dialog).getByText('Cette action est irréversible.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Confirmer la suppression' })); expect(confirm).toHaveBeenCalledTimes(1);
    await user.click(within(dialog).getByRole('button', { name: 'Annuler' })); expect(cancel).toHaveBeenCalledTimes(1);
    rerender(<ConfirmModal open title="Archiver ?" message="Le projet sera archivé." destructive={false} confirmLabel="Archiver" busy onConfirm={confirm} onCancel={cancel} />);
    expect(screen.getByRole('button', { name: 'Archiver' })).toHaveAttribute('aria-busy', 'true'); expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
    rerender(<ConfirmModal open={false} title="Archiver ?" message="x" onConfirm={confirm} onCancel={cancel} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('opens a right drawer with the same dialog behaviour', async () => {
    const user = userEvent.setup(); const close = jest.fn();
    const { rerender } = render(<Drawer open title="Fiche du projet" size="l" onClose={close} footer={<button>Fermer</button>}><p>Détails</p></Drawer>);
    const dialog = screen.getByRole('dialog', { name: 'Fiche du projet' });
    expect(dialog.style.maxWidth).toBe('720px'); expect(within(dialog).getByText('Détails')).toBeInTheDocument();
    await user.keyboard('{Escape}'); expect(close).toHaveBeenCalledTimes(1);
    rerender(<Drawer open={false} title="Fiche du projet" onClose={close} />); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('review fixes (CodeRabbit on #467)', () => {
  it('keeps focus in a field of a modal whose parent re-renders on every keystroke', async () => {
    const user = userEvent.setup();
    function Host() {
      const [value, setValue] = React.useState('');
      return <Modal open title="Nom du projet" onClose={() => undefined}><label htmlFor="name">Nom</label><input id="name" value={value} onChange={(event) => setValue(event.target.value)} /></Modal>;
    }
    render(<Host />);
    await user.click(screen.getByLabelText('Nom'));
    await user.keyboard('Voirie');
    expect(screen.getByLabelText('Nom')).toHaveFocus();
    expect(screen.getByLabelText('Nom')).toHaveValue('Voirie');
  });
  it('cannot be dismissed by Escape or the backdrop while the confirmation runs', async () => {
    const user = userEvent.setup(); const cancel = jest.fn();
    render(<ConfirmModal open busy title="Supprimer ?" message="Irréversible." onConfirm={() => undefined} onCancel={cancel} />);
    await user.keyboard('{Escape}');
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement!);
    await user.click(screen.getByRole('button', { name: 'Fermer la fenêtre' }));
    expect(cancel).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('modal title, description and select placeholder (MAIR-608 Calendars)', () => {
  it('links a description to the dialog and accepts a rich title', () => {
    render(<Modal open title={<>Détail<span role="status">Enregistrement en cours…</span></>} description="Ajoutez une date au calendrier." onClose={() => undefined}><p>x</p></Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleDescription('Ajoutez une date au calendrier.');
    expect(within(dialog).getByRole('status')).toHaveTextContent('Enregistrement en cours…');
  });
});

describe('focus hand-off between dialogs (Calendars details → editor, MAIR-608)', () => {
  it('keeps focus in the next dialog and focuses a busy dialog on its panel', async () => {
    const user = userEvent.setup();
    function Host() {
      const [step, setStep] = React.useState<'closed' | 'details' | 'editor'>('closed');
      return <>
        <button onClick={() => setStep('details')}>Ouvrir</button>
        {step === 'details' && <Modal open title="Détail" onClose={() => setStep('closed')}><button onClick={() => setStep('editor')}>Modifier</button></Modal>}
        {step === 'editor' && <Modal open title="Éditeur" onClose={() => setStep('closed')}><fieldset disabled><input aria-label="Titre" /><button>Enregistrer</button></fieldset></Modal>}
      </>;
    }
    render(<Host />);
    await user.click(screen.getByRole('button', { name: 'Ouvrir' }));
    await user.click(screen.getByRole('button', { name: 'Modifier' }));
    const editor = screen.getByRole('dialog', { name: 'Éditeur' });
    expect(editor.contains(document.activeElement)).toBe(true);
    expect(screen.getByRole('button', { name: 'Ouvrir' })).not.toHaveFocus();
  });
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
