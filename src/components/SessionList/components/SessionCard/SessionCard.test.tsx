import { fireEvent, render, screen } from '@testing-library/react';
import { Monitor } from 'lucide-react';
import { SessionCard } from './SessionCard';

it('lays one session on two lines and opens it from the row or the device button (MAIR-845)', () => {
  const onSelect = jest.fn();
  const { container } = render(<SessionCard device="Firefox 132" deviceIcon={Monitor} current status="active" statusLabel="Active" ipAddress="192.0.2.24"
    createdAt="2026-11-12T07:42:00Z" endAt="2026-11-19T07:42:00Z" endLabel="Expire le" timeZone="UTC" onSelect={onSelect} selectLabel="Voir le détail de la session Firefox 132" action={<button>Déconnecter</button>} />);
  expect(screen.getByText('Cet appareil')).toBeInTheDocument();
  expect(screen.getByText(/Expire le/)).toHaveTextContent('19 nov. 2026');
  fireEvent.click(screen.getByRole('button', { name: 'Voir le détail de la session Firefox 132' }));
  fireEvent.click(container.firstElementChild!);
  expect(onSelect).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole('button', { name: 'Déconnecter' }));
  expect(onSelect).toHaveBeenCalledTimes(2);
});
