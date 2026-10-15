import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { compile } from 'tailwindcss';
import postcss, { type Node as CssNode } from 'postcss';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { Toast } from '../components/Toast';
import { ToastProvider, useToast } from '../components/ToastProvider';

it('keeps decorative skeletons silent and announces only a supplied loading label', async () => {
  const { container, rerender } = render(<Skeleton data-testid="skeleton" />);
  expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  rerender(<Skeleton label="Chargement des dossiers" />);
  expect(screen.getByRole('status')).toHaveTextContent('Chargement des dossiers');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect((await axe(container)).violations).toEqual([]);
});

it('compiles skeleton animation only for users allowing motion', async () => {
  const { container, rerender } = render(<Skeleton />);
  const compiler = await compile('@theme { --animate-pulse: pulse 2s infinite; } @tailwind utilities;');
  const css = postcss.parse(compiler.build(Array.from(container.querySelector('[aria-hidden]')!.classList)));
  const animatedMedia: string[] = [];
  css.walkDecls('animation', declaration => {
    let ancestor: CssNode | undefined = declaration.parent;
    while (ancestor && ancestor.type !== 'atrule') ancestor = ancestor.parent;
    if (ancestor && 'params' in ancestor) animatedMedia.push(String(ancestor.params));
  });
  expect(animatedMedia).toContain('(prefers-reduced-motion: no-preference)');
  rerender(<Skeleton animated={false} />);
  expect(container.querySelector('[aria-hidden]')).not.toHaveClass('motion-safe:animate-pulse');
});

it('names an empty section and delegates its real keyboard action without focusing it', async () => {
  const user = userEvent.setup(); const create = jest.fn();
  const { container } = render(<EmptyState title="Aucun dossier" description="Créez le premier dossier." icon={<span>Décoration</span>} action={<button onClick={create}>Créer un dossier</button>} />);
  expect(screen.getByRole('region', { name: 'Aucun dossier' })).toHaveTextContent('Créez le premier dossier.');
  expect(screen.getByText('Décoration').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByRole('heading', { name: 'Aucun dossier' })).toBeInTheDocument();
  expect(create).not.toHaveBeenCalled(); expect(document.body).toHaveFocus();
  await user.tab(); await user.keyboard('{Enter}'); expect(create).toHaveBeenCalledTimes(1);
  expect((await axe(container)).violations).toEqual([]);
});

it.each(['info', 'success', 'warning'] as const)('announces %s politely and renders supplied content', variant => {
  render(<Toast variant={variant} title="Dossiers" message="Modification confirmée par le serveur" />);
  expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  expect(screen.getByRole('status')).toHaveTextContent('Dossiers');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('reserves alerts for errors and supports an accessible keyboard close', async () => {
  const user = userEvent.setup(); const close = jest.fn();
  const { container } = render(<Toast variant="error" message="Enregistrement impossible" closeLabel="Masquer cette erreur" onClose={close} />);
  expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  await user.tab(); expect(screen.getByRole('button', { name: 'Masquer cette erreur' })).toHaveFocus();
  await user.keyboard('{Escape}'); expect(close).toHaveBeenCalledTimes(1);
  await user.keyboard('{Enter}'); expect(close).toHaveBeenCalledTimes(2);
  expect((await axe(container)).violations).toEqual([]);
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
  await user.keyboard('{Escape}'); expect(screen.getByRole('status')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Fermer la notification' }));
  expect(screen.queryByRole('status')).not.toBeInTheDocument(); expect(trigger).toHaveFocus();
  await user.click(trigger); await user.click(screen.getByRole('button', { name: 'Autre contrôle' }));
  expect(screen.getByRole('button', { name: 'Autre contrôle' })).toHaveFocus();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
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
  it('keeps default notifications and errors persistent', () => {
    const first = setup(); open(); advance(100000); expect(screen.getByRole('status')).toBeInTheDocument(); first.unmount();
    setup(1000, 'error'); open(); advance(100000); expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  it('expires optional durations without programmatically moving focus', () => {
    setup(2000); open(); screen.getByRole('button', { name: 'Autre contrôle' }).focus();
    const focus = jest.spyOn(HTMLElement.prototype, 'focus'); advance(2000);
    expect(screen.queryByRole('status')).not.toBeInTheDocument(); expect(focus).not.toHaveBeenCalled(); focus.mockRestore();
  });
  it('pauses on hover and focused controls, retaining the remaining duration', () => {
    setup(3000); open(); advance(1000); const toast = screen.getByRole('status');
    fireEvent.mouseEnter(toast); advance(10000); expect(toast).toBeInTheDocument();
    fireEvent.mouseLeave(toast); advance(1000);
    act(() => screen.getByRole('button', { name: 'Fermer la notification' }).focus()); advance(10000); expect(toast).toBeInTheDocument();
    act(() => screen.getByRole('button', { name: 'Autre contrôle' }).focus()); advance(999); expect(toast).toBeInTheDocument();
    advance(1); expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
  it('pauses for inactive windows and hidden documents and cleans up on unmount', () => {
    const view = setup(3000); open(); advance(1000); fireEvent(window, new Event('blur')); advance(10000);
    expect(screen.getByRole('status')).toBeInTheDocument(); fireEvent(window, new Event('focus')); advance(1000);
    const hidden = jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden'); fireEvent(document, new Event('visibilitychange')); advance(10000);
    expect(screen.getByRole('status')).toBeInTheDocument(); hidden.mockReturnValue('visible'); fireEvent(document, new Event('visibilitychange')); advance(999);
    expect(screen.getByRole('status')).toBeInTheDocument(); advance(1); expect(screen.queryByRole('status')).not.toBeInTheDocument();
    open(); view.unmount(); expect(jest.getTimerCount()).toBe(0); hidden.mockRestore();
  });
});

it('keeps independent notifications and exposes an accessible populated region', async () => {
  const user = userEvent.setup(); const { container } = setup();
  await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
  await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
  expect(screen.getAllByRole('status')).toHaveLength(2);
  expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
  await user.click(screen.getAllByRole('button', { name: 'Fermer la notification' })[0]);
  expect(screen.getAllByRole('status')).toHaveLength(1);
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
  await user.tab(); await user.keyboard('{Escape}'); expect(screen.queryByRole('status')).not.toBeInTheDocument(); expect(trigger).toHaveFocus();
  await user.click(trigger); await user.tab(); const focus = jest.spyOn(HTMLElement.prototype, 'focus');
  act(() => dismissCurrent()); expect(screen.queryByRole('status')).not.toBeInTheDocument(); expect(focus).not.toHaveBeenCalled(); focus.mockRestore();
});

it('honors controlled keyboard handlers and optional presentation without inserting fallback text', () => {
  const close = jest.fn(); const { rerender } = render(<Toast message="Texte fourni" onClose={close} onKeyDown={event => event.preventDefault()} />);
  fireEvent.keyDown(screen.getByRole('status'), { key: 'Escape' }); expect(close).not.toHaveBeenCalled();
  rerender(<Toast message="Information disponible" />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument(); expect(screen.getByRole('status')).toHaveTextContent('Information disponible');
  rerender(<EmptyState title="Aucun résultat" />); expect(screen.getByRole('region')).toHaveTextContent('Aucun résultat');
});
