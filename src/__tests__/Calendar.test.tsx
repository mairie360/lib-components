import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CalendarSidebar } from '../components/CalendarSidebar';
import { CalendarToolbar } from '../components/CalendarToolbar';
import { DaySchedule } from '../components/DaySchedule';
import { MonthGrid } from '../components/MonthGrid';
import { ViewSwitcher } from '../components/ViewSwitcher';

describe('Calendar components', () => {
  it('changes the active value from the view switcher', () => {
    const handleChange = jest.fn();

    render(
      <ViewSwitcher
        value="month"
        onChange={handleChange}
        options={[
          { value: 'month', label: 'Mois' },
          { value: 'week', label: 'Semaine' },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Semaine' }));

    expect(handleChange).toHaveBeenCalledWith('week');
  });

  it('triggers toolbar navigation and view changes', () => {
    const handlePrevious = jest.fn();
    const handleNext = jest.fn();
    const handleViewChange = jest.fn();

    render(
      <CalendarToolbar
        title="Juin 2026"
        view="month"
        onPrevious={handlePrevious}
        onNext={handleNext}
        onViewChange={handleViewChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Période précédente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Période suivante' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Jour' }));

    expect(handlePrevious).toHaveBeenCalledTimes(1);
    expect(handleNext).toHaveBeenCalledTimes(1);
    expect(handleViewChange).toHaveBeenCalledWith('day');
  });

  it('renders month days and calls date selection', () => {
    const handleSelectDate = jest.fn();

    render(
      <MonthGrid
        currentDate="2026-06-15"
        selectedDate="2026-06-15"
        onSelectDate={handleSelectDate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sélectionner le 16 Juin 2026' }));

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(handleSelectDate).toHaveBeenCalledWith(new Date(2026, 5, 16));
  });

  it('renders day schedule events', () => {
    render(
      <DaySchedule
        currentDate="2026-06-15"
        events={[
          {
            id: 'event-1',
            title: 'Conseil municipal',
            date: '2026-06-15',
            startTime: '09:00',
          },
        ]}
      />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Juin 2026')).toBeInTheDocument();
    expect(screen.getByText('Conseil municipal')).toBeInTheDocument();
  });

  it('renders sidebar panels', () => {
    render(
      <CalendarSidebar
        showEmptyState
        stats={[
          { label: 'Ce mois', value: '12 événements' },
          { label: 'Cette semaine', value: '3 événements' },
        ]}
      />
    );

    expect(screen.getByRole('heading', { name: 'Événements à venir' })).toBeInTheDocument();
    expect(screen.getByText('Aucun événement à venir')).toBeInTheDocument();
    expect(screen.getByText('12 événements')).toBeInTheDocument();
  });
});
