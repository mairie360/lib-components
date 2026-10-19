import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as root from '../index';
import * as primitives from '../entries/primitives';
import * as shell from '../entries/shell';
import * as settings from '../entries/settings';
import * as dashboard from '../entries/dashboard';
import * as projects from '../entries/projects';
import * as messages from '../entries/messages';
import * as calendar from '../entries/calendar';
import * as admin from '../entries/admin';
import * as elearning from '../entries/elearning';

it('keeps every historical root runtime binding usable by existing consumers', () => {
  const historical = JSON.parse(readFileSync(resolve(process.cwd(), 'scripts/fixtures/ui-root-exports.json'), 'utf8')) as { runtimeExports: string[] };
  const bindings = root as Record<string, unknown>;
  for (const name of historical.runtimeExports) expect(bindings[name]).toBeDefined();
});

it.each(Object.entries({ primitives, shell, settings, dashboard, projects, messages, calendar, admin, elearning }))(
  '%s consumers share existing component and context identities with root consumers', (_name, entry) => {
    const existing = root as Record<string, unknown>;
    for (const [name, binding] of Object.entries(entry)) {
      if (Object.prototype.hasOwnProperty.call(existing, name)) expect(binding).toBe(existing[name]);
    }
  }
);

it('delivers and dismisses a confirmed notification across root and primitive entry points', async () => {
  const user = userEvent.setup();
  function Consumer() {
    const { notify } = primitives.useToast();
    return <primitives.Button label="Enregistrer" onClick={() => notify({ message: 'Profil confirmé', variant: 'success' })} />;
  }
  render(<root.ToastProvider regionLabel="Notifications de la fiche"><Consumer /></root.ToastProvider>);
  const trigger = screen.getByRole('button', { name: 'Enregistrer' });
  await user.click(trigger);
  const notifications = screen.getByRole('region', { name: 'Notifications de la fiche' });
  expect(within(notifications).getByText('Profil confirmé')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('Profil confirmé');
  await user.click(within(notifications).getByRole('button', { name: 'Fermer la notification' }));
  expect(screen.queryByRole('region', { name: 'Notifications de la fiche' })).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  expect(trigger).toHaveFocus();
});

it('selects a value when an existing root Select hosts modular primitive children', async () => {
  const user = userEvent.setup();
  const changes: string[] = [];
  render(<root.Select defaultValue="open" onValueChange={value => changes.push(value)}>
    <primitives.SelectTrigger aria-label="Statut du projet"><primitives.SelectValue /></primitives.SelectTrigger>
    <primitives.SelectContent>
      <primitives.SelectItem value="open">Ouvert</primitives.SelectItem>
      <primitives.SelectItem value="closed">Terminé</primitives.SelectItem>
    </primitives.SelectContent>
  </root.Select>);
  await user.click(screen.getByRole('button', { name: 'Statut du projet' }));
  await user.click(screen.getByRole('option', { name: 'Terminé' }));
  expect(screen.getByRole('button', { name: 'Statut du projet' })).toHaveTextContent('Terminé');
  expect(changes).toEqual(['closed']);
});
