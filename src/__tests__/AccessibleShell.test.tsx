import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { AccessibleShell } from '../components/AccessibleShell';
import { InstanceProvider } from '../kit/react';

const hrefs = { dashboard: '/dashboard', admin: '/admin', settings: '/settings' };

function shell(role: 'Admin' | 'User', children: React.ReactNode = <h1>Contenu</h1>) {
  return render(
    <InstanceProvider role={role} timeZone="Europe/Paris">
      <AccessibleShell activeItem="dashboard" hrefs={hrefs}>{children}</AccessibleShell>
    </InstanceProvider>,
  );
}

describe('AccessibleShell (MAIR-578)', () => {
  beforeEach(() => { document.cookie = 'mairie360_sidebar=; Max-Age=0; Path=/'; });

  it('derives the administration entry from the trusted instance role, not from props', () => {
    const { unmount } = shell('User');
    expect(screen.queryByRole('button', { name: 'Administration' })).toBeNull();
    unmount();
    shell('Admin');
    expect(screen.getAllByRole('button', { name: 'Administration' }).length).toBeGreaterThan(0);
  });

  it('renders the collapsible lib shell with the content footer and one main landmark', () => {
    const { container } = shell('User');
    expect(container.querySelector('aside.app-desktop-navigation')).not.toBeNull();
    expect(container.querySelector('.app-main-content')).toHaveTextContent('Contenu');
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('contentinfo')).toHaveClass('app-accessible-footer');
  });

  it('keeps the skip link inert while a consumer alert dialog is open, and restores it afterwards', async () => {
    const { container, rerender } = render(
      <InstanceProvider role="User" timeZone="Europe/Paris">
        <AccessibleShell activeItem="dashboard" hrefs={hrefs}><p>Contenu</p></AccessibleShell>
      </InstanceProvider>,
    );
    const skip = screen.getByRole('link', { name: 'Aller au contenu' });
    expect(skip.parentElement).not.toHaveAttribute('inert');
    rerender(
      <InstanceProvider role="User" timeZone="Europe/Paris">
        <AccessibleShell activeItem="dashboard" hrefs={hrefs}>
          <p>Contenu</p>
          <div role="alertdialog" aria-modal="true" aria-label="Confirmer"><button>Supprimer</button></div>
        </AccessibleShell>
      </InstanceProvider>,
    );
    await act(async () => { await Promise.resolve(); });
    expect(skip.parentElement).toHaveAttribute('inert');
    expect(container.querySelector('[data-navigation-inactive]')).not.toBeNull();
    rerender(
      <InstanceProvider role="User" timeZone="Europe/Paris">
        <AccessibleShell activeItem="dashboard" hrefs={hrefs}><p>Contenu</p></AccessibleShell>
      </InstanceProvider>,
    );
    await act(async () => { await Promise.resolve(); });
    expect(skip.parentElement).not.toHaveAttribute('inert');
  });
});
