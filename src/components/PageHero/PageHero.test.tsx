import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MonitorSmartphone, ShieldCheck } from 'lucide-react';

import { Avatar } from '../Avatar';
import { PageHero } from './PageHero';

// MAIR-1105: Figma `Base/PageHero` and `PageHero/Stat`.
describe('MAIR-1105 PageHero', () => {
  it('shows the identity on the slate band with clickable indicators named « libellé : valeur »', async () => {
    const user = userEvent.setup(); const open = jest.fn();
    const { container } = render(
      <PageHero
        overline="Mon compte"
        title="Camille Martin"
        subtitle="Agent · Urbanisme · camille.martin@mairie.fr"
        avatar={<Avatar alt="Camille Martin" size="xl" />}
        stats={<>
          <PageHero.Stat icon={ShieldCheck} label="Double authentification" value="Activée" dot="success" href="/securite" />
          <PageHero.Stat icon={MonitorSmartphone} label="Sessions actives" value={3} onClick={open} />
        </>}
      />,
    );
    const band = screen.getByRole('region', { name: 'Camille Martin' });
    expect(band.style.boxShadow).toBe('var(--mairie-shadow-pop)');
    expect(band.className).toContain('bg-[var(--mairie-hero-background)]');
    expect(screen.getByRole('heading', { level: 1, name: 'Camille Martin' })).toBeInTheDocument();
    expect(screen.getByText('Mon compte')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Double authentification : Activée' })).toHaveAttribute('href', '/securite');
    expect(container.querySelector('[data-dot="success"]')).toHaveStyle({ background: 'var(--mairie-hero-dot-success)' });
    await user.click(screen.getByRole('button', { name: 'Sessions actives : 3' }));
    expect(open).toHaveBeenCalledTimes(1);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('reaches the tiles with the keyboard and lays them in a responsive grid', async () => {
    const user = userEvent.setup();
    const { container } = render(<PageHero title="Paramètres"><PageHero.Stat label="Notifications" value="4 non lues" onClick={() => undefined} /></PageHero>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Notifications : 4 non lues' })).toHaveFocus();
    expect(container.querySelector('[data-page-hero-stats]')).toHaveClass('grid-cols-1', 'sm:grid-cols-3', 'min-[1100px]:flex');
  });

  it('has no stats area without stats, and takes an explicit name for a rich value', () => {
    const { container, rerender } = render(<PageHero title="Projets" />);
    expect(container.querySelector('[data-page-hero-stats]')).toBeNull();
    rerender(<PageHero title="Projets" stats={<PageHero.Stat label="Membres" value={<strong>12</strong>} aria-label="Membres : 12" href="/membres" />} />);
    expect(screen.getByRole('link', { name: 'Membres : 12' })).toBeInTheDocument();
  });
});
