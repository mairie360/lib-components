import { render, screen } from '@testing-library/react';
import { DateTime, formatDateTime, formatRelative } from './DateTime';

describe('DateTime (MAIR-608)', () => {
  it('formats dates in the instance time zone, relatively, and says Indisponible for an invalid value', () => {
    const now = new Date('2026-10-21T09:12:00Z');
    expect(formatDateTime('2026-10-21T07:12:00Z', 'short', 'Europe/Paris')).toBe('21/10/2026 09:12');
    expect(formatDateTime('2026-10-21T07:12:00Z', 'dateOnly', 'Europe/Paris')).toBe('21 octobre 2026');
    expect(formatRelative(new Date('2026-10-21T09:07:00Z'), now)).toBe('il y a 5 minutes');
    expect(formatRelative(new Date('2026-10-23T09:12:00Z'), now)).toBe('après-demain');
    expect(formatRelative(new Date('2026-10-21T09:11:50Z'), now)).toBe('à l’instant');
    const { rerender } = render(<DateTime value="2026-10-21T07:12:00Z" format="relative" now={now} timeZone="Europe/Paris" />);
    const time = screen.getByText('il y a 2 heures');
    expect(time.tagName).toBe('TIME'); expect(time).toHaveAttribute('datetime', '2026-10-21T07:12:00.000Z'); expect(time).toHaveAttribute('title', expect.stringContaining('21 octobre 2026'));
    rerender(<DateTime value="pas une date" />); expect(screen.getByText('Indisponible')).toHaveAttribute('data-format', 'unavailable');
    rerender(<DateTime value={null} unavailableText="—" />); expect(screen.getByText('—')).toBeInTheDocument();
  });
});
