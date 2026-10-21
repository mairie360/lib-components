import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import '@testing-library/jest-dom';

import { CurrentDate, formatCurrentDate } from '../components/CurrentDate';
import { InstanceProvider } from '../kit/react';

describe('CurrentDate (MAIR-578)', () => {
  it('formats the instance date in French with a capitalised weekday', () => {
    expect(formatCurrentDate(new Date('2026-10-20T10:00:00Z'), 'Europe/Paris')).toBe('Mardi 20 octobre 2026');
    expect(formatCurrentDate(new Date('2026-10-20T23:30:00Z'), 'Pacific/Auckland')).toBe('Mercredi 21 octobre 2026');
  });

  it('renders the page-current-date label on the client and nothing on the server', () => {
    render(<CurrentDate date={new Date('2026-10-20T10:00:00Z')} data-testid="date" />);
    expect(screen.getByTestId('date')).toHaveClass('page-current-date');
    expect(screen.getByTestId('date')).toHaveTextContent('20 octobre 2026');
    expect(renderToString(<CurrentDate date={new Date('2026-10-20T10:00:00Z')} />)).toContain('class="page-current-date"></span>');
  });
});

describe('CurrentDate across midnight (MAIR-578, review)', () => {
  it('re-renders with the new date once the instance day changes', () => {
    jest.useFakeTimers();
    try {
      jest.setSystemTime(new Date('2026-10-20T21:59:59.000Z')); // 23:59:59 in Europe/Paris
      const { container } = render(<InstanceProvider role="User" timeZone="Europe/Paris"><CurrentDate data-testid="date" /></InstanceProvider>);
      expect(container.textContent).toContain('20 octobre 2026');
      act(() => { jest.advanceTimersByTime(61_000); });
      expect(container.textContent).toContain('21 octobre 2026');
    } finally {
      jest.useRealTimers();
    }
  });
});
