import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from './DropdownMenu';
import { Field } from './Field';
import { FormSection } from './FormSection';
import { MultiSelect } from './MultiSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { SessionList } from './SessionList';
import { Tabs } from './Tabs';
import { TextField } from './TextField';

/**
 * Non-regression tests of MAIR-473: the defects the RGAA gate of the CI raised on the lib's
 * Storybook. Each block names the RGAA criterion it guards.
 */
describe('MAIR-473 RGAA defects of lib-components', () => {
  it('1.2: the decorative svgs of Select are hidden from assistive technologies', () => {
    render(
      <Select defaultValue="a">
        <SelectTrigger aria-label="Choix"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="a">Alpha</SelectItem></SelectContent>
      </Select>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Choix' }));
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('focusable', 'false');
    });
  });

  it('1.2: the check and radio indicators of DropdownMenu are hidden from assistive technologies', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Notifications</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a"><DropdownMenuRadioItem value="a">Accueil</DropdownMenuRadioItem></DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
    svgs.forEach((svg) => expect(svg).toHaveAttribute('aria-hidden', 'true'));
  });

  it('3.2: a disabled Field dims its label and control but never its hint', () => {
    render(<Field htmlFor="f" label="Nom" hint="Non modifiable" disabled><input id="f" disabled /></Field>);
    const hint = screen.getByText('Non modifiable');
    for (let node: HTMLElement | null = hint; node; node = node.parentElement) {
      expect(node).not.toHaveClass('opacity-60');
    }
    expect(screen.getByRole('textbox').parentElement).toHaveClass('opacity-60');
    expect(screen.getByText('Nom').parentElement).toHaveClass('opacity-60');
  });

  it('3.2: toggling disabled on a Field does not remount its control', () => {
    const { rerender } = render(<Field htmlFor="f" label="Nom"><input id="f" defaultValue="" /></Field>);
    const input = screen.getByRole('textbox');
    rerender(<Field htmlFor="f" label="Nom" disabled><input id="f" defaultValue="" /></Field>);
    expect(screen.getByRole('textbox')).toBe(input);
  });

  it('5.4: the SessionList table has a title, overridable by the caller', () => {
    const sessions = [{ id: '1', device_info: 'Chrome', ip_address: '10.0.0.1', created_at: '2026-10-21T09:12:00Z', expires_at: '2026-10-22T09:12:00Z' }];
    const { rerender } = render(<SessionList sessions={sessions} now={Date.parse('2026-10-21T10:00:00Z')} />);
    expect(screen.getByRole('table', { name: 'Sessions de connexion' })).toBeInTheDocument();
    rerender(<SessionList sessions={sessions} caption="Sessions de Marie Martin" now={Date.parse('2026-10-21T10:00:00Z')} />);
    expect(screen.getByRole('table', { name: 'Sessions de Marie Martin' })).toBeInTheDocument();
  });

  it('10.7: the inner input of an adorned TextField and of MultiSelect draws its own focus indicator', () => {
    render(<><TextField label="Courriel" type="email" /><MultiSelect label="Membres" options={[{ value: 'a', label: 'Alpha' }]} value={[]} onChange={() => undefined} /></>);
    expect(screen.getByLabelText('Courriel').className).toMatch(/focus-within:shadow-\[inset_0_-2px_0_var\(--mairie-accent\)\]/);
    expect(screen.getByRole('searchbox').className).toMatch(/focus-within:shadow-\[inset_0_-2px_0_var\(--mairie-accent\)\]/);
  });

  it('10.11: the Tabs row wraps instead of overflowing a 320 px canvas (CodeRabbit on #508)', () => {
    render(<Tabs label="Sections" value="a" onChange={() => undefined} items={[{ key: 'a', label: 'Utilisateurs' }, { key: 'b', label: 'Rôles' }]} panels={{ a: <p>A</p>, b: <p>B</p> }} />);
    expect(screen.getByRole('tablist', { name: 'Sections' })).toHaveClass('flex-wrap');
  });

  it('11.6: the FormSection group is named by a legend holding its title and description', () => {
    render(<FormSection title="Informations personnelles" description="Visibles par les autres agents."><input aria-label="Prénom" /></FormSection>);
    const group = screen.getByRole('group', { name: /Informations personnelles/ });
    const legend = group.querySelector(':scope > legend');
    expect(legend).not.toBeNull();
    expect(within(legend as HTMLElement).getByRole('heading', { level: 2, name: 'Informations personnelles' })).toBeInTheDocument();
    expect(legend).toHaveTextContent('Visibles par les autres agents.');
    expect(screen.getByRole('region', { name: 'Informations personnelles' })).toBeInTheDocument();
  });
});
