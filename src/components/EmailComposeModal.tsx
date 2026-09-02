import React from 'react';
import { Paperclip, Send, X } from 'lucide-react';

import { defaultEmailAttachmentExtensions } from './email/defaultData';
import { formatEmailAttachmentSize } from './email/utils';
import type { EmailAttachment, EmailComposeMode, EmailComposeValues } from './email/types';

export interface EmailComposeModalProps {
  isOpen: boolean;
  mode?: EmailComposeMode;
  initialValues?: Partial<EmailComposeValues>;
  acceptedExtensions?: string[];
  maxAttachmentSizeBytes?: number;
  onCancel: (values: EmailComposeValues) => void;
  onSend: (values: EmailComposeValues) => void;
}

const emptyValues: EmailComposeValues = { to: '', subject: '', body: '', attachments: [] };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EmailComposeModal = ({ isOpen, mode = 'new', initialValues, acceptedExtensions = defaultEmailAttachmentExtensions, maxAttachmentSizeBytes = 10 * 1024 ** 2, onCancel, onSend }: EmailComposeModalProps) => {
  const [values, setValues] = React.useState<EmailComposeValues>(emptyValues);
  const [error, setError] = React.useState('');
  const titleId = React.useId();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) setValues({ ...emptyValues, ...initialValues, attachments: initialValues?.attachments ?? [] });
    setError('');
  }, [isOpen, initialValues]);

  if (!isOpen) return null;
  const title = mode === 'reply' ? 'Répondre' : mode === 'reply-all' ? 'Répondre à tous' : mode === 'forward' ? 'Transférer' : mode === 'draft' ? 'Modifier le brouillon' : 'Nouveau message';

  const addAttachment = (file?: File) => {
    if (!file) return;
    const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
    if (!acceptedExtensions.includes(extension)) return setError(`Le type ${extension} n’est pas autorisé.`);
    if (file.size > maxAttachmentSizeBytes) return setError(`La pièce jointe dépasse ${formatEmailAttachmentSize(maxAttachmentSizeBytes)}.`);
    if (values.attachments.some((item) => item.name === file.name)) return setError('Cette pièce jointe est déjà ajoutée.');
    const attachment: EmailAttachment = { id: `attachment-${Date.now()}`, name: file.name, sizeBytes: file.size, sizeLabel: formatEmailAttachmentSize(file.size), mimeType: file.type, file };
    setValues((current) => ({ ...current, attachments: [...current.attachments, attachment] }));
    setError('');
  };

  const submit = () => {
    const recipients = values.to.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
    if (recipients.length === 0 || recipients.some((email) => !emailPattern.test(email))) return setError('Saisissez une adresse e-mail valide.');
    if (!values.subject.trim()) return setError('Saisissez l’objet du message.');
    if (!values.body.trim()) return setError('Saisissez votre message.');
    onSend(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="w-full max-w-lg rounded-lg border border-[#d8d2ca] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4"><div><h2 id={titleId} className="text-xl font-bold text-[#172033]">{title}</h2><p className="mt-1 text-sm text-[#687385]">Composer et envoyer un nouvel email</p></div><button type="button" aria-label="Fermer" className="rounded p-1" onClick={() => onCancel(values)}><X className="size-5" /></button></div>
        <label className="mt-4 block text-sm font-semibold">À<input aria-label="À" value={values.to} onChange={(event) => { setValues({ ...values, to: event.target.value }); setError(''); }} placeholder="destinataire@mairie.fr" className="mt-1 h-9 w-full rounded-md border border-[#d8d2ca] px-3 font-normal outline-none focus:border-[#155bb5]" /></label>
        <label className="mt-3 block text-sm font-semibold">Objet<input value={values.subject} onChange={(event) => { setValues({ ...values, subject: event.target.value }); setError(''); }} placeholder="Objet du message" className="mt-1 h-9 w-full rounded-md border border-[#d8d2ca] px-3 font-normal outline-none focus:border-[#155bb5]" /></label>
        <label className="mt-3 block text-sm font-semibold">Message<textarea value={values.body} onChange={(event) => { setValues({ ...values, body: event.target.value }); setError(''); }} placeholder="Tapez votre message..." rows={8} className="mt-1 w-full resize-y rounded-md border border-[#d8d2ca] p-3 font-normal outline-none focus:border-[#155bb5]" /></label>
        {values.attachments.length > 0 && <div className="mt-3 space-y-2">{values.attachments.map((attachment) => <div key={attachment.id} className="flex items-center justify-between rounded-md bg-[#edf9f8] px-3 py-2 text-sm"><span>{attachment.name} · {attachment.sizeLabel}</span><button type="button" aria-label={`Retirer ${attachment.name}`} onClick={() => setValues((current) => ({ ...current, attachments: current.attachments.filter((item) => item.id !== attachment.id) }))}><X className="size-4" /></button></div>)}</div>}
        {error && <p role="alert" className="mt-3 rounded-md bg-[#fff1f2] px-3 py-2 text-sm text-[#b91c1c]">{error}</p>}
        <div className="mt-4 flex items-center justify-between gap-3"><button type="button" className="inline-flex items-center gap-2 rounded-md border border-[#d8d2ca] px-4 py-2 text-sm font-medium" onClick={() => fileInputRef.current?.click()}><Paperclip className="size-4" />Joindre un fichier</button><input ref={fileInputRef} aria-label="Choisir une pièce jointe" type="file" accept={acceptedExtensions.join(',')} className="sr-only" onChange={(event) => addAttachment(event.target.files?.[0])} /><div className="flex gap-2"><button type="button" className="rounded-md border border-[#d8d2ca] px-4 py-2 text-sm" onClick={() => onCancel(values)}>Annuler</button><button type="button" className="inline-flex items-center gap-2 rounded-md bg-[#155bb5] px-4 py-2 text-sm font-semibold text-white" onClick={submit}><Send className="size-4" />Envoyer</button></div></div>
      </div>
    </div>
  );
};
