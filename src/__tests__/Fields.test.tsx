import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Checkbox } from '../components/Checkbox';
import { EmailField, FieldPresets, PasswordField, SearchField } from '../components/FieldPresets';
import { FileField } from '../components/FileField';
import { FilterSelect } from '../components/FilterSelect';
import { FormActions } from '../components/FormActions';
import { FormSection } from '../components/FormSection';
import { MultiSelect } from '../components/MultiSelect';
import { RadioGroup } from '../components/RadioGroup';
import { SelectField } from '../components/SelectField';
import { Slider } from '../components/Slider';
import { Switch } from '../components/Switch';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';

describe('TextField (MAIR-608)', () => {
  it('links label, hint and error to the input and sizes it from the scale', () => {
    const { rerender } = render(<TextField label="Nom" hint="Tel qu’il apparaît sur la carte" required size="l" />);
    const input = screen.getByLabelText(/Nom/);
    expect(input).toHaveAccessibleDescription('Tel qu’il apparaît sur la carte');
    expect(input).toBeRequired();
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input.parentElement!.style.minHeight).toBe('var(--mairie-control-l)');
    rerender(<TextField label="Nom" hint="Tel qu’il apparaît sur la carte" error="Le nom est obligatoire." required size="l" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Le nom est obligatoire.');
    expect(screen.getByLabelText(/Nom/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Nom/)).toHaveAccessibleDescription('Le nom est obligatoire.');
  });

  it('forwards the ref and native props as react-hook-form registers them', () => {
    const ref = React.createRef<HTMLInputElement>();
    const onChange = jest.fn();
    render(<TextField ref={ref} label="Prénom" name="first_name" onChange={onChange} />);
    expect(ref.current).toBe(screen.getByLabelText('Prénom'));
    expect(ref.current).toHaveAttribute('name', 'first_name');
    fireEvent.change(ref.current!, { target: { value: 'Marie' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('toggles the password visibility and clears a search', async () => {
    const user = userEvent.setup();
    const onClear = jest.fn();
    render(<><PasswordField defaultValue="secret" /><SearchField value="mairie" onChange={() => undefined} onClear={onClear} /></>);
    const password = screen.getByLabelText('Mot de passe');
    expect(password).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Masquer le mot de passe' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Effacer la recherche' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('exposes the field presets with their French labels and native types', () => {
    render(<EmailField />);
    expect(screen.getByLabelText('Adresse e-mail')).toHaveAttribute('type', 'email');
    expect(Object.keys(FieldPresets).sort()).toEqual(['date', 'email', 'name', 'number', 'password', 'phone', 'search']);
  });
});

describe('Choice controls (MAIR-608)', () => {
  it('renders a textarea, a checkbox and a radio group with accessible errors', async () => {
    const user = userEvent.setup();
    const onTheme = jest.fn();
    render(
      <>
        <TextArea label="Commentaire" error="Trop long." />
        <Checkbox label="Recevoir les notifications" hint="Par e-mail" defaultChecked />
        <RadioGroup label="Thème" name="theme" options={[{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }]} defaultValue="light" onChange={onTheme} />
      </>,
    );
    expect(screen.getByLabelText('Commentaire')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('checkbox', { name: 'Recevoir les notifications' })).toBeChecked();
    expect(screen.getByRole('group', { name: 'Thème' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Sombre' }));
    expect(onTheme).toHaveBeenCalledWith('dark');
    expect(screen.getByRole('radio', { name: 'Sombre' })).toBeChecked();
  });

  it('toggles the switch, keeps a hidden form value and lets the slider report numbers', async () => {
    const user = userEvent.setup();
    const onSwitch = jest.fn();
    const onSlide = jest.fn();
    const { container } = render(<><Switch label="Ouverture automatique" name="auto_open" onChange={onSwitch} /><Slider label="Taille de police" min={14} max={24} defaultValue={16} format={(v) => `${v} px`} onChange={onSlide} /></>);
    const toggle = screen.getByRole('switch', { name: 'Ouverture automatique' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(onSwitch).toHaveBeenCalledWith(true);
    expect(container.querySelector('input[name="auto_open"]')).toHaveValue('true');
    const slider = screen.getByRole('slider', { name: 'Taille de police' });
    expect(slider).toHaveAttribute('aria-valuetext', '16 px');
    fireEvent.change(slider, { target: { value: '20' } });
    expect(onSlide).toHaveBeenCalledWith(20);
    expect(screen.getByText('20 px')).toBeInTheDocument();
  });

  it('reports selected files and lets the agent remove them', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    const { rerender } = render(<FileField label="Photo de profil" onChange={onChange} constraint="PNG, JPG · 2 Mo max" />);
    expect(screen.getByText('PNG, JPG · 2 Mo max')).toBeInTheDocument();
    await user.upload(screen.getByLabelText(/Photo de profil/), file);
    expect(onChange).toHaveBeenLastCalledWith([file]);
    rerender(<FileField label="Photo de profil" onChange={onChange} files={[file]} previewSrc="blob:photo" />);
    expect(screen.getByText(/photo\.png/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retirer' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('Select controls (MAIR-608)', () => {
  const options = [{ value: 'dashboard', label: 'Tableau de bord' }, { value: 'projects', label: 'Projets' }, { value: 'calendar', label: 'Calendrier' }] as const;

  it('renders a native select with a placeholder and reports the chosen value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SelectField label="Page d’accueil" options={options} value="" onChange={onChange} hint="Ouverte après la connexion." />);
    const select = screen.getByLabelText('Page d’accueil');
    expect(within(select).getAllByRole('option')).toHaveLength(4);
    await user.selectOptions(select, 'projects');
    expect(onChange).toHaveBeenCalledWith('projects');
  });

  it('filters, toggles and removes multi-select entries with chips', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(<MultiSelect label="Membres" options={options} value={['projects']} onChange={onChange} name="members" />);
    expect(screen.getByRole('button', { name: 'Retirer Projets' })).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox'), 'cal');
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    await user.click(screen.getByRole('checkbox', { name: 'Calendrier' }));
    expect(onChange).toHaveBeenLastCalledWith(['projects', 'calendar']);
    rerender(<MultiSelect label="Membres" options={options} value={['projects', 'calendar']} onChange={onChange} name="members" />);
    await user.click(screen.getByRole('button', { name: 'Retirer Projets' }));
    expect(onChange).toHaveBeenLastCalledWith(['calendar']);
    expect(document.querySelectorAll('input[name="members"]')).toHaveLength(2);
  });

  it('shows the active filter value and clears it', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(<FilterSelect label="Statut" options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]} value="" onChange={onChange} />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Statut' }), 'active');
    expect(onChange).toHaveBeenCalledWith('active');
    rerender(<FilterSelect label="Statut" options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]} value="active" onChange={onChange} />);
    expect(screen.getByText('Statut : Actif')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Statut' }).parentElement).toHaveAttribute('data-active', 'true');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Statut' }), '');
    expect(onChange).toHaveBeenLastCalledWith('');
  });
});

describe('FormSection and FormActions (MAIR-608)', () => {
  it('disables the fields while busy and renders the status, cancel and save actions', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const onSubmit = jest.fn((event: React.FormEvent) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <FormSection title="Informations personnelles" description="Visibles par les autres agents." footer={<FormActions status="Aucune modification à enregistrer." onCancel={onCancel} saveDisabled />}>
          <TextField label="Prénom" />
        </FormSection>
      </form>,
    );
    expect(screen.getByRole('region', { name: 'Informations personnelles' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aucune modification à enregistrer.');
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    rerender(
      <form onSubmit={onSubmit}>
        <FormSection title="Informations personnelles" busy footer={<FormActions busy onCancel={onCancel} />}>
          <TextField label="Prénom" />
        </FormSection>
      </form>,
    );
    expect(screen.getByLabelText('Prénom')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
  });
});
