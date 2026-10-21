import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Skeleton } from '../components/Skeleton';
import { DataState } from '../components/DataState';
import { Toast } from '../components/Toast';
import { TOAST_DEFAULT_DURATION, ToastProvider, useToast } from '../components/ToastProvider';

// JSDOM has no active native window; model the normal focused application explicitly.
beforeEach(() => jest.spyOn(document, 'hasFocus').mockReturnValue(true));
afterEach(() => jest.restoreAllMocks());

it('keeps decorative skeletons silent and announces only a supplied loading label', async () => {
  const { container, rerender } = render(<Skeleton data-testid="skeleton" />);
  expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  rerender(<Skeleton label="Chargement des dossiers" />);
  expect(screen.getByRole('status')).toHaveTextContent('Chargement des dossiers');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect((await axe(container)).violations).toEqual([]);
});

it('shimmers only for users allowing motion and offers the Figma shapes and presets (MAIR-608)', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles/municipal-theme.css'), 'utf8');
  const motion = css.slice(css.indexOf('.mairie-skeleton-animated'));
  expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.mairie-skeleton-animated/);
  expect(motion).toContain('animation: mairie-shimmer');
  const { container, rerender } = render(<Skeleton shape="circle" size="l" />);
  const bone = container.querySelector('[aria-hidden]') as HTMLElement;
  expect(bone).toHaveClass('mairie-skeleton-animated'); expect(bone).toHaveAttribute('data-shape', 'circle');
  expect(bone.style.width).toBe('var(--mairie-avatar-l)');
  rerender(<Skeleton animated={false} />);
  expect(container.querySelector('[aria-hidden]')).not.toHaveClass('mairie-skeleton-animated');
  rerender(<Skeleton.UserIdentity label="Chargement de l’agent" />);
  expect(screen.getByRole('status')).toHaveTextContent('Chargement de l’agent');
  expect(container.querySelectorAll('[data-shape="circle"]')).toHaveLength(1);
  rerender(<Skeleton.TableRow columns={3} />);
  expect(container.querySelectorAll('[data-shape="line"]')).toHaveLength(3);
});

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

it.each(['info', 'success', 'warning'] as const)('announces %s politely and renders supplied content', tone => {
  render(<Toast tone={tone} title="Dossiers" message="Modification confirmée par le serveur" />);
  expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  expect(screen.getByRole('status')).toHaveTextContent('Dossiers');
  expect(screen.getByRole('status')).toHaveAttribute('data-tone', tone);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('reserves alerts for danger toasts (legacy variant error) and supports an accessible keyboard close', async () => {
  const user = userEvent.setup(); const close = jest.fn();
  const { container, rerender } = render(<Toast tone="danger" message="Enregistrement impossible" closeLabel="Masquer cette erreur" onClose={close} />);
  expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  await user.tab(); expect(screen.getByRole('button', { name: 'Masquer cette erreur' })).toHaveFocus();
  await user.keyboard('{Escape}'); expect(close).toHaveBeenCalledTimes(1);
  await user.keyboard('{Enter}'); expect(close).toHaveBeenCalledTimes(2);
  expect((await axe(container)).violations).toEqual([]);
  rerender(<Toast variant="error" message="Ancien appel" />);
  expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'danger');
});

function Harness({ duration, variant = 'info' }: { duration?: number; variant?: 'info' | 'error' }) {
  const { notify, dismiss } = useToast(); const id = React.useRef('');
  return <><button onClick={() => { id.current = notify({ message: 'Reçu du serveur', duration, variant }); }}>Enregistrer</button><button onClick={() => dismiss(id.current)}>Autre contrôle</button></>;
}
function setup(duration?: number, variant?: 'info' | 'error') {
  return render(<ToastProvider regionLabel="Notifications"><Harness duration={duration} variant={variant} /></ToastProvider>);
}

it('never steals focus on arrival, restores the invoking control on manual close and ignores Escape outside', async () => {
  const user = userEvent.setup(); const { container } = setup(); const trigger = screen.getByRole('button', { name: 'Enregistrer' });
  await user.click(trigger); expect(trigger).toHaveFocus();
  await user.keyboard('{Escape}'); expect(screen.getByRole('status')).toHaveTextContent('Reçu du serveur');
  await user.click(screen.getByRole('button', { name: 'Fermer la notification' }));
  expect(screen.getByRole('status')).toBeEmptyDOMElement(); expect(trigger).toHaveFocus();
  await user.click(trigger); await user.click(screen.getByRole('button', { name: 'Autre contrôle' }));
  expect(screen.getByRole('button', { name: 'Autre contrôle' })).toHaveFocus();
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  expect((await axe(container)).violations).toEqual([]);
});

it('does not restore focus to a disabled trigger', async () => {
  const user = userEvent.setup(); setup(); const trigger = screen.getByRole('button', { name: 'Enregistrer' });
  await user.click(trigger); trigger.setAttribute('disabled', '');
  await user.click(screen.getByRole('button', { name: 'Fermer la notification' }));
  expect(trigger).not.toHaveFocus();
});

it('supports provider close labels and fails clearly without its provider', () => {
  const onError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  expect(() => render(<Harness />)).toThrow('ToastProvider'); onError.mockRestore();
  render(<ToastProvider regionLabel="Messages" closeLabel="Dismiss"><Harness /></ToastProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
  expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
});

describe('opt-in toast timing', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => { jest.runOnlyPendingTimers(); jest.useRealTimers(); });
  const advance = (ms: number) => act(() => { jest.advanceTimersByTime(ms); });
  const open = () => fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
  it('suspends a receipt arriving in an already inactive visible window until focus returns', () => {
    jest.mocked(document.hasFocus).mockReturnValue(false);
    function Receipt() {
      const { notify } = useToast();
      React.useEffect(() => { notify({ message: 'Dossier reçu', duration: 2000 }); }, [notify]);
      return null;
    }
    render(<ToastProvider regionLabel="Notifications"><Receipt /></ToastProvider>);
    advance(10000); expect(screen.getByRole('status')).toHaveTextContent('Dossier reçu');
    jest.mocked(document.hasFocus).mockReturnValue(true); fireEvent(window, new Event('focus'));
    advance(1999); expect(screen.getByRole('status')).not.toBeEmptyDOMElement();
    advance(1); expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
  it('keeps one timer per notification through StrictMode effect replay', () => {
    const view = render(<React.StrictMode><ToastProvider regionLabel="Notifications"><Harness duration={2000} /></ToastProvider></React.StrictMode>);
    open(); expect(jest.getTimerCount()).toBe(1);
    advance(1999); expect(screen.getByRole('status')).not.toBeEmptyDOMElement();
    advance(1); expect(screen.getByRole('status')).toBeEmptyDOMElement();
    view.unmount(); expect(jest.getTimerCount()).toBe(0);
  });
  it('keeps default notifications and errors persistent', () => {
    const first = setup(); open(); advance(100000); expect(screen.getByRole('status')).not.toBeEmptyDOMElement(); first.unmount();
    setup(1000, 'error'); open(); advance(100000); expect(screen.getByRole('alert')).toHaveTextContent('Reçu du serveur');
  });
  it('expires optional durations without programmatically moving focus', () => {
    setup(2000); open(); screen.getByRole('button', { name: 'Autre contrôle' }).focus();
    const focus = jest.spyOn(HTMLElement.prototype, 'focus'); advance(2000);
    expect(screen.getByRole('status')).toBeEmptyDOMElement(); expect(focus).not.toHaveBeenCalled(); focus.mockRestore();
  });
  it('pauses on hover and focused controls, retaining the remaining duration', () => {
    setup(3000); open(); advance(1000); const toast = screen.getByRole('group', { name: 'Reçu du serveur' });
    fireEvent.mouseEnter(toast); advance(10000); expect(toast).toBeInTheDocument();
    fireEvent.mouseLeave(toast); advance(1000);
    act(() => screen.getByRole('button', { name: 'Fermer la notification' }).focus()); advance(10000); expect(toast).toBeInTheDocument();
    act(() => screen.getByRole('button', { name: 'Autre contrôle' }).focus()); advance(999); expect(toast).toBeInTheDocument();
    advance(1); expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
  it('pauses for inactive windows and hidden documents and cleans up on unmount', () => {
    const view = setup(3000); open(); advance(1000); fireEvent(window, new Event('blur')); advance(10000);
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement(); fireEvent(window, new Event('focus')); advance(1000);
    const hidden = jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden'); fireEvent(document, new Event('visibilitychange')); advance(10000);
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement(); hidden.mockReturnValue('visible'); fireEvent(document, new Event('visibilitychange')); advance(999);
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement(); advance(1); expect(screen.getByRole('status')).toBeEmptyDOMElement();
    open(); view.unmount(); expect(jest.getTimerCount()).toBe(0); hidden.mockRestore();
  });
  it('draws the countdown bar of a timed toast, freezes it while paused and omits it on persistent toasts (MAIR-608)', () => {
    setup(4000); open();
    const bar = screen.getByTestId('toast-progress').firstElementChild as HTMLElement;
    expect(bar.style.width).toBe('0%'); expect(bar.style.transition).toBe('width 4000ms linear');
    advance(1000); fireEvent.mouseEnter(screen.getByRole('group', { name: 'Reçu du serveur' }));
    expect(bar.style.width).toBe('75%'); expect(bar.style.transition).toBe('none');
    fireEvent.mouseLeave(screen.getByRole('group', { name: 'Reçu du serveur' }));
    expect(bar.style.width).toBe('0%'); expect(bar.style.transition).toBe('width 3000ms linear');
    screen.getByRole('button', { name: 'Fermer la notification' }).click();
    render(<ToastProvider regionLabel="Autres"><Harness variant="error" duration={4000} /></ToastProvider>);
    fireEvent.click(screen.getAllByRole('button', { name: 'Enregistrer' })[1]);
    expect(screen.queryByTestId('toast-progress')).not.toBeInTheDocument();
  });
  it('exposes the Figma tone shortcuts: error and warning persist, success and info count down 5 s', () => {
    function Shortcuts() {
      const toast = useToast();
      return <>
        <button onClick={() => toast.error('Échec de l’enregistrement')}>Erreur</button>
        <button onClick={() => toast.warning('Mode dégradé')}>Avertissement</button>
        <button onClick={() => toast.success('Profil enregistré')}>Succès</button>
        <button onClick={() => toast.info('Nouvelle version disponible', { showProgress: false })}>Info</button>
      </>;
    }
    render(<ToastProvider regionLabel="Notifications"><Shortcuts /></ToastProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Erreur' })); fireEvent.click(screen.getByRole('button', { name: 'Avertissement' }));
    fireEvent.click(screen.getByRole('button', { name: 'Succès' })); fireEvent.click(screen.getByRole('button', { name: 'Info' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Échec de l’enregistrement');
    expect(screen.getAllByRole('group')).toHaveLength(4);
    expect(screen.getAllByTestId('toast-progress')).toHaveLength(1);
    advance(TOAST_DEFAULT_DURATION);
    expect(screen.getAllByRole('group').map(group => group.getAttribute('data-tone'))).toEqual(['danger', 'warning']);
  });
});

it('keeps independent notifications and exposes an accessible populated region', async () => {
  const user = userEvent.setup(); const { container } = setup();
  await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
  await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
  expect(screen.getAllByRole('group', { name: 'Reçu du serveur' })).toHaveLength(2);
  expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
  await user.click(screen.getAllByRole('button', { name: 'Fermer la notification' })[0]);
  expect(screen.getAllByRole('group', { name: 'Reçu du serveur' })).toHaveLength(1);
  expect((await axe(container)).violations).toEqual([]);
});

it('allows Escape from a focused toast and never steals focus after programmatic removal', async () => {
  const user = userEvent.setup(); let dismissCurrent: () => void = () => undefined;
  function Controls() {
    const { notify, dismiss } = useToast();
    return <button onClick={() => { const id = notify({ message: 'Dossier enregistré' }); dismissCurrent = () => dismiss(id); }}>Créer</button>;
  }
  render(<ToastProvider regionLabel="Notifications"><Controls /></ToastProvider>);
  const trigger = screen.getByRole('button', { name: 'Créer' }); await user.click(trigger);
  await user.tab(); await user.keyboard('{Escape}'); expect(screen.getByRole('status')).toBeEmptyDOMElement(); expect(trigger).toHaveFocus();
  await user.click(trigger); await user.tab(); const focus = jest.spyOn(HTMLElement.prototype, 'focus');
  act(() => dismissCurrent()); expect(screen.getByRole('status')).toBeEmptyDOMElement(); expect(focus).not.toHaveBeenCalled(); focus.mockRestore();
});

it('honors controlled keyboard handlers and optional presentation without inserting fallback text', () => {
  const close = jest.fn(); const { rerender } = render(<Toast message="Texte fourni" onClose={close} onKeyDown={event => event.preventDefault()} />);
  fireEvent.keyDown(screen.getByRole('status'), { key: 'Escape' }); expect(close).not.toHaveBeenCalled();
  rerender(<Toast message="Information disponible" />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument(); expect(screen.getByRole('status')).toHaveTextContent('Information disponible');
});

it('mounts stable empty announcement regions before notifications and preserves identical batched receipts', () => {
  function Batch() {
    const { notify } = useToast();
    return <button onClick={() => {
      notify({ title: 'Dossiers', message: 'Reçu confirmé' });
      notify({ title: 'Dossiers', message: 'Reçu confirmé' });
      notify({ message: 'Échec confirmé', tone: 'danger' });
    }}>Recevoir</button>;
  }
  render(<React.StrictMode><ToastProvider regionLabel="Notifications"><Batch /></ToastProvider></React.StrictMode>);
  const polite = screen.getByRole('status'); const assertive = screen.getByRole('alert');
  expect(polite).toBeEmptyDOMElement(); expect(assertive).toBeEmptyDOMElement();
  expect(polite).toHaveAttribute('aria-live', 'polite'); expect(assertive).toHaveAttribute('aria-live', 'assertive');
  [polite, assertive].forEach(region => { expect(region).toHaveAttribute('aria-relevant', 'additions'); expect(region).toHaveAttribute('aria-atomic', 'false'); });
  fireEvent.click(screen.getByRole('button', { name: 'Recevoir' }));
  expect(screen.getByRole('status')).toBe(polite); expect(screen.getByRole('alert')).toBe(assertive);
  expect(polite.children).toHaveLength(2); expect(assertive.children).toHaveLength(1);
  expect(polite.children[0]).toHaveTextContent('Dossiers Reçu confirmé'); expect(polite.children[1]).toHaveTextContent('Dossiers Reçu confirmé');
  expect(screen.getAllByRole('status')).toHaveLength(1); expect(screen.getAllByRole('alert')).toHaveLength(1);
  expect(screen.getAllByRole('button', { name: 'Fermer la notification' })).toHaveLength(3);
  screen.getAllByRole('group').forEach(toast => expect(toast).not.toHaveAttribute('aria-live'));
  screen.getAllByRole('button', { name: 'Fermer la notification' }).forEach(button => fireEvent.click(button));
  expect(polite).toBeEmptyDOMElement(); expect(assertive).toBeEmptyDOMElement();
});
