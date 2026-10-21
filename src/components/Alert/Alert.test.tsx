import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Alert, AlertPresets, ErrorAlert, UnavailableAlert, WarningAlert } from './Alert';

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
