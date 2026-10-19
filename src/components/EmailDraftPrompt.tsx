import React from 'react';

export interface EmailDraftPromptProps {
  isOpen: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export const EmailDraftPrompt = ({ isOpen, onDiscard, onSave }: EmailDraftPromptProps) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--mairie-overlay-background)]/45 p-4" role="dialog" aria-modal="true" aria-label="Enregistrer le brouillon ?"><div className="w-full max-w-sm rounded-lg bg-[var(--mairie-surface)] p-6 shadow-xl"><h2 className="text-lg font-bold text-[var(--mairie-text)]">Enregistrer le brouillon ?</h2><p className="mt-3 text-sm text-[var(--mairie-muted)]">Votre message n’est pas envoyé. Vous pouvez le conserver dans Brouillons.</p><div className="mt-5 flex justify-end gap-2"><button type="button" className="rounded-md border border-[var(--mairie-border)] px-4 py-2 text-sm" onClick={onDiscard}>Ignorer</button><button type="button" className="rounded-md bg-[var(--mairie-action-background)] px-4 py-2 text-sm font-semibold text-[var(--mairie-on-action)]" onClick={onSave}>Enregistrer le brouillon</button></div></div></div>;
};
