import { render, screen } from '@testing-library/react';
import { SessionDate } from './SessionDate';

describe('SessionDate', () => {
  it('shows the reported timestamp in the instance time zone or says the date is unavailable', () => {
    const { rerender } = render(<SessionDate value="2026-10-21T07:12:00Z" timeZone="Europe/Paris" />);
    expect(screen.getByText(/21 oct\. 2026/).tagName).toBe('TIME');
    rerender(<SessionDate value="pas une date" />);
    expect(screen.getByText('Date indisponible')).toBeInTheDocument();
  });
});
