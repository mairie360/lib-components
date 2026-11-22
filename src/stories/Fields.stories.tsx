import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { Checkbox } from '../components/Checkbox';
import { DateField, EmailField, NameField, NewPasswordField, NumberField, PasswordField, PhoneField, SearchField, TimeField } from '../components/FieldPresets';
import { checkNewPassword } from '../kit/password';
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
import { sizes } from '../kit/theme';

const meta = {
  title: 'Components/Forms/Fields',
  component: TextField,
  tags: ['autodocs'],
  args: { label: 'Libellé', hint: 'Texte d’aide', size: 'm', onChange: fn() },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: (args) => (
    <div className="grid max-w-3xl gap-6 md:grid-cols-2">
      <TextField {...args} />
      <TextField {...args} label="Avec erreur" error="Message d’erreur" required />
      <TextField {...args} label="Désactivé" disabled />
      <TextArea label="Commentaire" hint="500 caractères maximum." />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => <div className="grid max-w-md gap-4">{sizes.map((size) => <TextField key={size} {...args} label={`Taille ${size}`} size={size} />)}</div>,
};

export const Presets: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-6 md:grid-cols-2">
      <EmailField /><PasswordField /><NewPasswordField /><SearchField onClear={fn()} /><PhoneField /><DateField /><TimeField label="Heure de début" step={900} /><NumberField /><NameField />
    </div>
  ),
};

function NewPasswordDemo() {
  const [value, setValue] = useState('mairie');
  return <NewPasswordField value={value} onChange={(event) => setValue(event.target.value)} error={checkNewPassword(value) ?? undefined} />;
}
/** MAIR-837: the shared rule (12 characters, digits and letters) checked as the agent types. */
export const NewPassword: Story = { render: () => <div className="max-w-sm"><NewPasswordDemo /></div> };

const options = [{ value: 'dashboard', label: 'Tableau de bord' }, { value: 'projects', label: 'Projets' }, { value: 'calendar', label: 'Calendrier' }, { value: 'messages', label: 'Messagerie' }];

function ChoiceDemo() {
  const [members, setMembers] = useState<string[]>(['projects']);
  const [status, setStatus] = useState<string>('');
  const [home, setHome] = useState<string>('');
  return (
    <div className="grid max-w-3xl gap-6 md:grid-cols-2">
      <SelectField label="Page d’accueil par défaut" options={options} value={home} onChange={setHome} hint="Page ouverte après la connexion." />
      <MultiSelect label="Membres du projet" options={options} value={members} onChange={setMembers} />
      <RadioGroup label="Thème" name="theme" options={[{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }, { value: 'system', label: 'Système' }]} defaultValue="light" inline />
      <div className="flex flex-col gap-4">
        <Checkbox label="Recevoir les notifications de la messagerie" />
        <Switch label="Ouverture automatique des notifications" defaultChecked />
        <Slider label="Taille de police" min={14} max={24} defaultValue={16} format={(v) => `${v} px`} />
        <FilterSelect label="Statut" options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]} value={status} onChange={setStatus} />
        <FilterSelect mode="menu" label="Statut (menu)" options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]} value={status} onChange={setStatus} />
      </div>
      <FileField label="Photo de profil" constraint="PNG, JPG · 2 Mo max" onChange={fn()} />
    </div>
  );
}

export const Choices: Story = { render: () => <ChoiceDemo /> };

export const Section: Story = {
  render: () => (
    <form className="max-w-2xl" onSubmit={(event) => event.preventDefault()}>
      <FormSection title="Informations personnelles" description="Ces informations sont visibles par les autres agents." footer={<FormActions status="Aucune modification à enregistrer." onCancel={fn()} saveDisabled />}>
        <NameField label="Prénom" /><NameField /><EmailField />
      </FormSection>
    </form>
  ),
};

function DirtyFormDemo() {
  const [name, setName] = useState('Marie Martin');
  const [service, setService] = useState('État civil');
  const changed = Number(name !== 'Marie Martin') + Number(service !== 'État civil');
  return (
    <form className="flex max-h-72 max-w-xl flex-col gap-4 overflow-y-auto rounded-lg border border-[var(--mairie-border)] p-4" onSubmit={(event) => event.preventDefault()}>
      <TextField label="Nom" value={name} onChange={(event) => setName(event.target.value)} />
      <TextField label="Service" value={service} onChange={(event) => setService(event.target.value)} />
      <p className="h-40 text-[var(--mairie-muted)]">Faites défiler : la barre d’actions reste collée en bas.</p>
      <FormActions sticky dirty={changed > 0} status={changed > 0 ? `${changed} ${changed > 1 ? 'champs modifiés' : 'champ modifié'}.` : undefined}
        onCancel={() => { setName('Marie Martin'); setService('État civil'); }} />
    </form>
  );
}
/** MAIR-1118: clean = buttons disabled and « Aucune modification à enregistrer. »; dirty = accent bar, buttons enabled; `sticky` keeps it at the bottom. */
export const DirtyFormActions: Story = { render: () => <DirtyFormDemo /> };
