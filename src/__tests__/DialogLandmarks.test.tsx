import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Drawer } from '../components/Drawer';
import { NotificationCenter } from '../components/NotificationCenter';
import { Modal } from '../components/Modal';

// MAIR-1226 RGAA 9.2: a dialog opened over the page header adds no second banner landmark.
const landmarkRules = {
  runOnly: { type: 'rule' as const, values: ['landmark-no-duplicate-banner', 'landmark-unique', 'landmark-one-main'] },
};

function Page({ children }: { children: React.ReactNode }) {
  return <><header>Mairie</header><main><h1>Projets</h1></main>{children}</>;
}

describe('MAIR-1226 dialogs add no banner landmark (RGAA 9.2)', () => {
  it.each([
    ['Modal', <Modal key="m" open title="Supprimer le projet ?" onClose={jest.fn()}><p>Corps</p></Modal>],
    ['Drawer', <Drawer key="d" open title="Fiche du projet" onClose={jest.fn()}><p>Corps</p></Drawer>],
    ['NotificationCenter', <NotificationCenter key="n" source={{ list: jest.fn().mockResolvedValue([]), markRead: jest.fn() }} onClose={jest.fn()} />],
  ])('%s keeps a single banner', async (_name, dialog) => {
    const { container } = render(<Page>{dialog}</Page>);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(container.querySelector('[role="dialog"] header')).toBeNull();
    expect((await axe(container, landmarkRules)).violations).toEqual([]);
  });
});
