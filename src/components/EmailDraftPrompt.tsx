import React from 'react';

export interface EmailDraftPromptProps {
  isOpen: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export const EmailDraftPrompt = ({ isOpen, onDiscard, onSave }: EmailDraftPromptProps) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Enregistrer le brouillon ?"><div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"><h2 className="text-lg font-bold text-[#172033]">Enregistrer le brouillon ?</h2><p className="mt-3 text-sm text-[#687385]">Votre message n’est pas envoyé. Vous pouvez le conserver dans Brouillons.</p><div className="mt-5 flex justify-end gap-2"><button type="button" className="rounded-md border border-[#d8d2ca] px-4 py-2 text-sm" onClick={onDiscard}>Ignorer</button><button type="button" className="rounded-md bg-[#155bb5] px-4 py-2 text-sm font-semibold text-white" onClick={onSave}>Enregistrer le brouillon</button></div></div></div>;
};
