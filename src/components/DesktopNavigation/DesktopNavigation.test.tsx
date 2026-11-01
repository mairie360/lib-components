import { fireEvent, render, screen } from '@testing-library/react';
import { DesktopNavigation } from './DesktopNavigation';
import { AppShell } from '../AppShell';

beforeEach(() => { document.cookie = 'mairie360_sidebar=; Max-Age=0; Path=/'; });

test('MAIR-548 collapsed commands keep their accessible names and labels stay in the DOM', () => {
  const { container } = render(<DesktopNavigation hrefs={{ settings: '/settings' }} onCollapsedChange={() => undefined} />);
  expect(container.querySelector('aside')).toHaveAttribute('data-expanded', 'false');
  const command = screen.getByRole('button', { name: 'Paramètres' });
  expect(command.querySelector('.app-navigation-label')).toHaveTextContent('Paramètres');
  expect(command).not.toHaveAttribute('aria-describedby');
  expect(document.cookie).not.toContain('mairie360_sidebar=v1');
});

test('MAIR-548 AppShell keeps one main, one full-width footer outside the navigation row', () => {
  const { container } = render(<AppShell collapsibleSidebar hrefs={{ settings: '/settings' }}><h1>Paramètres</h1></AppShell>);
  const frame = container.querySelector('.app-shell-frame')!;
  expect(frame).toHaveAttribute('data-sidebar-collapsed', 'true');
  fireEvent.mouseEnter(container.querySelector('aside.app-desktop-navigation')!);
  expect(frame).toHaveAttribute('data-sidebar-collapsed', 'false');
  expect(screen.getAllByRole('main')).toHaveLength(1);
  expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
  const footer = screen.getByRole('contentinfo');
  expect(footer.closest('aside')).toBeNull();
  expect(footer.closest('.app-shell-body')).toBeNull();
  expect(footer.parentElement!.parentElement).toBe(frame);
  expect(container.querySelector('.app-shell-body > aside.app-desktop-navigation')).not.toHaveAttribute('inert');
  expect(screen.getByRole('main')).toHaveClass('app-shell-main');
});

test('the desktop menu rejects unsafe destinations and filters administration by role', () => {
  const { container } = render(<DesktopNavigation hrefs={{ settings: '/settings', admin: '/admin', projects: 'javascript:alert(1)', calendar: '//unsafe.test/' }} onCollapsedChange={() => undefined} />);
  expect(container.querySelectorAll('nav button')).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Paramètres' })).toBeVisible();
});
