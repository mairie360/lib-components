import { act, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { SessionDetails } from './SessionDetails';

const session = {
  id: 'sess_7f3a9c2e41b8',
  device_info: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  ip_address: '192.0.2.24',
  created_at: '2026-11-12T07:42:00Z',
  expires_at: '2026-11-19T07:42:00Z',
  location: 'Lyon, France',
  last_active_at: '2026-11-12T09:30:00Z',
};
const now = Date.parse('2026-11-12T10:00:00Z');
const value = (label: string) => screen.getByText(label, { selector: 'dt' }).nextElementSibling;

describe('SessionDetails (MAIR-930)', () => {
  it('shows the current session with its readable device and dates', async () => {
    const { container } = render(<SessionDetails session={session} current timeZone="Europe/Paris" now={now} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Cet appareil')).toHaveAttribute('data-tone', 'primary');
    expect(screen.getByText('Session en cours')).toBeInTheDocument();
    expect(value('Navigateur')).toHaveTextContent('Firefox 132');
    expect(value('Système')).toHaveTextContent('Windows');
    expect(value('Type d’appareil')).toHaveTextContent('Ordinateur');
    expect(value('Localisation')).toHaveTextContent('Lyon, France');
    expect(value('Connexion')).toHaveTextContent('12 nov. 2026, 08:42');
    expect(value('Dernière activité')).toHaveTextContent('10:30');
    expect(value('Expiration')).toHaveTextContent('19 nov. 2026');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('labels the end of an expired or revoked session and reports missing values', () => {
    const { rerender } = render(<SessionDetails session={{ ...session, location: null, last_active_at: null }} now={Date.parse('2026-12-01T00:00:00Z')} timeZone="UTC" />);
    expect(screen.queryByText('Cet appareil')).not.toBeInTheDocument();
    expect(value('Expirée le')).toHaveTextContent('19 nov. 2026');
    expect(value('Localisation')).toHaveTextContent('Non disponible');
    rerender(<SessionDetails session={{ ...session, revoked_at: '2026-11-13T08:00:00Z' }} now={now} timeZone="UTC" />);
    expect(value('Déconnectée le')).toHaveTextContent('13 nov. 2026');
  });

  it('copies the identifier and announces it', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<SessionDetails session={session} now={now} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copier l’identifiant' })); });
    expect(writeText).toHaveBeenCalledWith('sess_7f3a9c2e41b8');
    expect(screen.getByRole('status')).toHaveTextContent('Identifiant copié');
  });
});
