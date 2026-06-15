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

  it('calls event click without selecting the day cell', () => {
    const handleSelectDate = jest.fn();
    const handleEventClick = jest.fn();

    render(
      <MonthGrid
        currentDate="2026-06-15"
        selectedDate="2026-06-15"
        events={[
          {
            id: 'event-1',
            title: 'Conseil municipal',
            date: '2026-06-15',
          },
        ]}
        onSelectDate={handleSelectDate}
        onEventClick={handleEventClick}
      />
    );

    fireEvent.click(screen.getByText('Conseil municipal'));

    expect(handleEventClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'event-1',
        title: 'Conseil municipal',
      })
    );
    expect(handleSelectDate).not.toHaveBeenCalled();
  });

  it('renders multi-day and recurring events on matching days', () => {
    render(
      <MonthGrid
        currentDate="2026-06-15"
        selectedDate="2026-06-15"
        events={[
          {
            id: 'multi-day',
            title: 'Festival',
            date: '2026-06-15',
            endDate: '2026-06-16',
          },
          {
            id: 'weekly',
            title: 'Permanence',
            date: '2026-06-15',
            recurrence: {
              frequency: 'weekly',
              interval: 1,
              daysOfWeek: [1, 3],
              endsOn: '2026-06-30',
            },
          },
        ]}
      />
    );

    expect(screen.getAllByText('Festival')).toHaveLength(2);
    expect(screen.getAllByText('Permanence')).toHaveLength(5);
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

  it('renders event duration visually in day schedule', () => {
    render(
      <DaySchedule
        currentDate="2026-06-15"
        events={[
          {
            id: 'event-1',
            title: 'Atelier',
            date: '2026-06-15',
            startTime: '09:00',
            endTime: '10:30',
          },
        ]}
      />
    );

    expect(screen.getByText('Atelier').parentElement).toHaveStyle({ height: '92px' });
  });

  it('renders the visible part of multi-day events in day schedule', () => {
    render(
      <DaySchedule
        currentDate="2026-06-16"
        events={[
          {
            id: 'event-1',
            title: 'Formation',
            date: '2026-06-15',
            endDate: '2026-06-16',
            startTime: '09:00',
            endTime: '10:30',
          },
          {
            id: 'event-2',
            title: 'Nocturne',
            date: '2026-06-15',
            endDate: '2026-06-16',
            startTime: '20:00',
            endTime: '05:00',
          },
        ]}
      />
    );

    expect(screen.getByText('Formation').parentElement).toHaveStyle({ top: '0px', height: '284px' });
    expect(screen.queryByText('Nocturne')).not.toBeInTheDocument();
  });

  it('only compresses events when their times overlap', () => {
    render(
      <DaySchedule
        currentDate="2026-06-15"
        events={[
          {
            id: 'event-1',
            title: 'Début',
            date: '2026-06-15',
            startTime: '09:00',
            endTime: '10:00',
          },
          {
            id: 'event-2',
            title: 'Chevauchement',
            date: '2026-06-15',
            startTime: '09:30',
            endTime: '10:30',
          },
          {
            id: 'event-3',
            title: 'Libre',
            date: '2026-06-15',
            startTime: '12:00',
            endTime: '13:00',
          },
        ]}
      />
    );

    expect(screen.getByText('Début').parentElement).toHaveAttribute(
      'style',
      expect.stringContaining('width: calc(50% - 4px);')
    );
    expect(screen.getByText('Libre').parentElement).toHaveAttribute(
      'style',
      expect.stringContaining('width: calc(100% - 4px);')
    );
  });

  it('renders all events in a month cell', () => {
    render(
      <MonthGrid
        currentDate="2026-06-15"
        selectedDate="2026-06-15"
        events={[
          {
            id: 'event-1',
            title: 'Matin',
            date: '2026-06-15',
            startTime: '08:00',
          },
          {
            id: 'event-2',
            title: 'Midi',
            date: '2026-06-15',
            startTime: '12:00',
          },
          {
            id: 'event-3',
            title: 'Soir',
            date: '2026-06-15',
            startTime: '17:00',
          },
        ]}
      />
    );

    expect(screen.getByText('Matin')).toBeInTheDocument();
    expect(screen.getByText('Midi')).toBeInTheDocument();
    expect(screen.getByText('Soir')).toBeInTheDocument();
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

  it('calculates sidebar stats from calendar events', () => {
    render(
      <CalendarSidebar
        currentDate="2026-06-15"
        events={[
          {
            id: 'single',
            title: 'Conseil municipal',
            date: '2026-06-15',
          },
          {
            id: 'multi-day',
            title: 'Festival',
            date: '2026-06-15',
            endDate: '2026-06-16',
          },
          {
            id: 'weekly',
            title: 'Permanence',
            date: '2026-06-15',
            recurrence: {
              frequency: 'weekly',
              interval: 1,
              daysOfWeek: [1, 3],
              endsOn: '2026-06-30',
            },
          },
        ]}
      />
    );

    expect(screen.getByText('8 événements')).toBeInTheDocument();
    expect(screen.getByText('5 événements')).toBeInTheDocument();
    expect(screen.getByText('3 événements')).toBeInTheDocument();
  });
});
