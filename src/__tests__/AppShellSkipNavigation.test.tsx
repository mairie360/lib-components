import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell } from '../components/AppShell';

it('offers the skip link before built-in desktop commands and moves the keyboard directly to main content', async () => {
  const keyboard = userEvent.setup();
  render(<AppShell collapsibleSidebar hrefs={{ settings: '/settings' }}><h1>Paramètres</h1><button>Action du contenu</button></AppShell>);

  await keyboard.tab();
  const skip = screen.getByRole('link', { name: 'Aller au contenu' });
  expect(skip).toHaveFocus();
  await keyboard.tab();
  expect(screen.getByRole('button', { name: 'Réduire la navigation' })).toHaveFocus();
  await keyboard.tab({ shift: true });
  await keyboard.keyboard('{Enter}');
  expect(screen.getByRole('main')).toHaveFocus();
  await keyboard.tab();
  expect(screen.getByRole('button', { name: 'Action du contenu' })).toHaveFocus();
});

it('places a supplied desktop navigation after the same skip link without adding built-in commands', async () => {
  const keyboard = userEvent.setup();
  render(<AppShell desktopNavigation={<nav aria-label="Navigation de la commune"><button>Formations municipales</button></nav>}
    collapsibleSidebar hrefs={{ settings: '/settings' }}><h1>Formations</h1><button>Ouvrir une formation</button></AppShell>);

  await keyboard.tab();
  const skip = screen.getByRole('link', { name: 'Aller au contenu' });
  expect(skip).toHaveFocus();
  await keyboard.tab();
  expect(screen.getByRole('button', { name: 'Formations municipales' })).toHaveFocus();
  expect(screen.queryByRole('button', { name: 'Réduire la navigation' })).not.toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Aller au contenu' })).toHaveLength(1);
  await keyboard.tab({ shift: true });
  await keyboard.keyboard('{Enter}');
  expect(screen.getByRole('main')).toHaveFocus();
  await keyboard.tab();
  expect(screen.getByRole('button', { name: 'Ouvrir une formation' })).toHaveFocus();
});

it('disables only the skip link during an external dialog and restores the same main target afterwards', async () => {
  const keyboard = userEvent.setup();
  const { rerender } = render(<AppShell skipLinkInactive hrefs={{}}><div role="dialog" aria-modal="true" aria-label="Confirmer une action"><button>Confirmer</button></div></AppShell>);
  const skip = screen.getByRole('link', { name: 'Aller au contenu' });
  const main = screen.getByRole('main');
  expect(skip.parentElement).toHaveAttribute('inert');
  expect(main.parentElement).not.toHaveAttribute('inert');
  expect(skip).toHaveAttribute('href', `#${main.id}`);
  const confirmation = screen.getByRole('button', { name: 'Confirmer' });
  confirmation.focus();
  expect(confirmation).toHaveFocus();

  rerender(<AppShell hrefs={{}}><h1>Action confirmée</h1><button>Continuer</button></AppShell>);
  expect(skip.parentElement).not.toHaveAttribute('inert');
  expect(screen.getAllByRole('main')).toEqual([main]);
  expect(screen.getAllByRole('link', { name: 'Aller au contenu' })).toEqual([skip]);
  expect(skip).toHaveAttribute('href', `#${main.id}`);
  await keyboard.tab();
  expect(skip).toHaveFocus();
  await keyboard.keyboard('{Enter}');
  expect(main).toHaveFocus();
  await keyboard.tab();
  expect(screen.getByRole('button', { name: 'Continuer' })).toHaveFocus();
});
