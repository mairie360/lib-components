import { act, fireEvent, render, screen } from '@testing-library/react';
// JSDOM has no active native window; model the normal focused application explicitly.
beforeEach(() => jest.spyOn(document, 'hasFocus').mockReturnValue(true));
afterEach(() => jest.restoreAllMocks());
import { ToastAnnouncementContext } from '../../../Toast';
import { TimedToast } from './TimedToast';

// Inside the provider the toasts are groups: the live regions announce them.
const mount = (ui: React.ReactElement) => render(<ToastAnnouncementContext.Provider value={false}>{ui}</ToastAnnouncementContext.Provider>);

describe('TimedToast', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => { jest.runOnlyPendingTimers(); jest.useRealTimers(); });
  it('closes on timeout, pauses while hovered and closes manually', () => {
    const close = jest.fn(); const register = jest.fn();
    mount(<TimedToast entry={{ id: 't1', options: { message: 'Reçu du serveur', duration: 2000 }, trigger: null }} inactive={false} closeLabel="Fermer la notification" close={close} register={register} />);
    expect(register).toHaveBeenCalledWith('t1', expect.any(HTMLElement));
    const toast = screen.getByRole('group', { name: 'Reçu du serveur' });
    fireEvent.mouseEnter(toast); act(() => { jest.advanceTimersByTime(5000); }); expect(close).not.toHaveBeenCalled();
    fireEvent.mouseLeave(toast); act(() => { jest.advanceTimersByTime(2000); }); expect(close).toHaveBeenCalledWith('t1', 'timeout');
    fireEvent.click(screen.getByRole('button', { name: 'Fermer la notification' })); expect(close).toHaveBeenLastCalledWith('t1', 'manual');
  });
  it('never counts a danger toast down', () => {
    const close = jest.fn();
    mount(<TimedToast entry={{ id: 't2', options: { message: 'Échec', tone: 'danger', duration: 1000 }, trigger: null }} inactive={false} closeLabel="Fermer" close={close} register={jest.fn()} />);
    act(() => { jest.advanceTimersByTime(10000); });
    expect(close).not.toHaveBeenCalled(); expect(screen.queryByTestId('toast-progress')).not.toBeInTheDocument();
  });
});
