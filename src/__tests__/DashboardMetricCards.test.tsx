import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { DashboardMetricCards } from '../components/DashboardMetricCards';
import { defaultDashboardMetrics as metrics } from '../stories/dashboardFixtures';
it('shows supplied values beside the correct metric labels', async () => { const { container } = render(<DashboardMetricCards metrics={metrics} />); for (const metric of metrics) { expect(screen.getByText(metric.label)).toBeVisible(); expect(screen.getByText(String(metric.value))).toBeVisible(); } expect((await axe(container)).violations).toEqual([]); });
