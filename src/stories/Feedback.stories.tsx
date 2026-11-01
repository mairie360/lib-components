import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import React from 'react';

import { Alert, ErrorAlert, InfoAlert, SuccessAlert, UnavailableAlert, WarningAlert } from '../components/Alert';
import { DataState } from '../components/DataState';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Drawer } from '../components/Drawer';
import { ToastProvider, useToast } from '../components/ToastProvider';
import { Button } from '../components/Button';
import { CancelButton, SaveButton } from '../components/ButtonPresets';
import { EmailField } from '../components/FieldPresets';
import { tones } from '../kit/theme';

const meta = { title: 'Components/Feedback/Alert', component: Alert, tags: ['autodocs'], args: { title: 'Titre du message', description: 'Description détaillée de l’alerte, avec le contexte utile pour l’agent.', tone: 'info', size: 'm', onDismiss: fn() } } satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Tones: Story = { render: (args) => <div className="flex w-[560px] flex-col gap-3">{tones.map((tone) => <Alert key={tone} {...args} tone={tone} title={tone} />)}</div> };
export const Presets: Story = { render: () => <div className="flex w-[560px] flex-col gap-3"><ErrorAlert description="L’enregistrement a échoué." /><WarningAlert description="Cette action est irréversible." /><InfoAlert description="Les horaires changent le 1er novembre." /><SuccessAlert /><UnavailableAlert onAction={fn()} /></div> };
export const DataStates: Story = { render: () => <div className="grid w-[900px] grid-cols-2 gap-4">{(['loading', 'empty', 'unavailable', 'error'] as const).map((state) => <div key={state} className="rounded-lg border border-[var(--mairie-border)]"><DataState state={state} onRetry={fn()} onCreate={fn()} /></div>)}</div> };
function Toasts() {
  const toast = useToast();
  return <div className="flex gap-2"><Button label="Erreur" tone="danger" onClick={() => toast.error('L’action n’a pas pu être effectuée.')} /><Button label="Succès" tone="success" onClick={() => toast.success('Profil enregistré.')} /><Button label="Avertissement" tone="warning" onClick={() => toast.warning('Mode dégradé : certaines données sont en cache.')} /><Button label="Info" tone="info" onClick={() => toast.info('Nouvelle version disponible.')} /></div>;
}
/** `useToast().error/success/warning/info`: errors and warnings persist, success and info count down 5 s with the bar. */
export const ToastShortcuts: Story = { render: () => <ToastProvider regionLabel="Notifications"><Toasts /></ToastProvider> };
function ModalHost() {
  const [open, setOpen] = React.useState(false);
  return <><Button label="Nouveau projet" onClick={() => setOpen(true)} /><Modal open={open} title="Nouveau projet" onClose={() => setOpen(false)} footer={<><CancelButton onClick={() => setOpen(false)} /><SaveButton onClick={() => setOpen(false)} /></>}><EmailField /></Modal></>;
}
function ConfirmHost() {
  const [open, setOpen] = React.useState(false);
  return <><Button label="Supprimer" tone="danger" variant="outline" onClick={() => setOpen(true)} /><ConfirmModal open={open} title="Supprimer le projet ?" message="Cette action est irréversible." onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} /></>;
}
function DrawerHost() {
  const [open, setOpen] = React.useState(false);
  return <><Button label="Voir la fiche" variant="outline" onClick={() => setOpen(true)} /><Drawer open={open} title="Fiche du projet" onClose={() => setOpen(false)}><p>Détails du projet.</p></Drawer></>;
}
export const Overlays: Story = { render: () => <div className="flex gap-3"><ModalHost /><ConfirmHost /><DrawerHost /></div> };
