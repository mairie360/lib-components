import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { EmailModule } from '../components/EmailModule';

describe('EmailModule', () => {
  it('renders folders, the message list and the synchronized reader', () => {
    render(<EmailModule />);
    expect(screen.getByRole('navigation', { name: 'Dossiers e-mail' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Boîte de réception' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nouvelle réglementation - Accessibilité' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lire Formation obligatoire sécurité' }));
    expect(screen.getByRole('heading', { name: 'Formation obligatoire sécurité' })).toBeInTheDocument();
  });

  it('navigates folders and searches sender, subject and body', () => {
    render(<EmailModule />);
    fireEvent.change(screen.getByPlaceholderText('Rechercher...'), { target: { value: 'prefecture' } });
    expect(screen.getByRole('button', { name: 'Lire Subvention projet culturel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lire Formation obligatoire sécurité' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Envoyés/ }));
    expect(screen.getByRole('heading', { name: 'Envoyés' })).toBeInTheDocument();
    expect(screen.getByText('Aucun e-mail dans ce dossier.')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Rechercher...'), { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Lire Budget validé' })).toBeInTheDocument();
  });

  it('marks unread messages and toggles favorites', () => {
    const onMessageAction = jest.fn();
    render(<EmailModule onMessageAction={onMessageAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lire Nouvelle réglementation - Accessibilité' }));
    expect(onMessageAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'accessibility-regulation' }), 'read');
    fireEvent.click(screen.getByRole('button', { name: 'Retirer Nouvelle réglementation - Accessibilité des favoris' }));
    fireEvent.click(screen.getByRole('button', { name: /Messages favoris/ }));
    expect(screen.queryByRole('button', { name: 'Lire Nouvelle réglementation - Accessibilité' })).not.toBeInTheDocument();
  });

  it('validates composition, attaches a file and sends once', () => {
    const onSend = jest.fn();
    render(<EmailModule onSend={onSend} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nouveau message' }));
    const dialog = screen.getByRole('dialog', { name: 'Nouveau message' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Envoyer' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('adresse e-mail valide');
    fireEvent.change(within(dialog).getByLabelText('À'), { target: { value: 'citoyen@example.fr' } });
    fireEvent.change(within(dialog).getByPlaceholderText('Objet du message'), { target: { value: 'Réponse dossier' } });
    fireEvent.change(within(dialog).getByPlaceholderText('Tapez votre message...'), { target: { value: 'Votre dossier est traité.' } });
    const attachment = new File(['pdf'], 'dossier.pdf', { type: 'application/pdf' });
    fireEvent.change(within(dialog).getByLabelText('Choisir une pièce jointe'), { target: { files: [attachment] } });
    expect(within(dialog).getByText(/dossier.pdf/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Envoyer' }));
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith(expect.objectContaining({ mode: 'new', values: expect.objectContaining({ to: 'citoyen@example.fr', attachments: [expect.objectContaining({ name: 'dossier.pdf' })] }) }));
    expect(screen.getByRole('status')).toHaveTextContent('E-mail envoyé.');
  });

  it('offers to keep a modified composition as a draft', () => {
    const onSaveDraft = jest.fn();
    render(<EmailModule onSaveDraft={onSaveDraft} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nouveau message' }));
    fireEvent.change(screen.getByPlaceholderText('Objet du message'), { target: { value: 'À reprendre' } });
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    const prompt = screen.getByRole('dialog', { name: 'Enregistrer le brouillon ?' });
    fireEvent.click(within(prompt).getByRole('button', { name: 'Enregistrer le brouillon' }));
    expect(onSaveDraft).toHaveBeenCalledWith(expect.objectContaining({ subject: 'À reprendre' }));
    fireEvent.click(screen.getByRole('button', { name: /Brouillons/ }));
    expect(screen.getByRole('button', { name: 'Lire À reprendre' })).toBeInTheDocument();
  });

  it('updates an existing draft without creating a duplicate', () => {
    render(<EmailModule />);
    fireEvent.click(screen.getByRole('button', { name: /Brouillons/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Reprendre le brouillon' }));
    const compose = screen.getByRole('dialog', { name: 'Modifier le brouillon' });
    fireEvent.change(within(compose).getByPlaceholderText('Tapez votre message...'), {
      target: { value: 'Contenu du brouillon mis à jour.' },
    });
    fireEvent.click(within(compose).getByRole('button', { name: 'Annuler' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le brouillon' }));
    expect(screen.getAllByRole('button', { name: 'Lire Préparation conseil' })).toHaveLength(1);
  });

  it('prefills reply-all without duplicating the current user and opens attachments', () => {
    const onOpenAttachment = jest.fn();
    render(<EmailModule onOpenAttachment={onOpenAttachment} />);
    fireEvent.click(screen.getByRole('button', { name: /Mesures_accessibilite_2025.pdf/ }));
    expect(onOpenAttachment).toHaveBeenCalledWith(expect.objectContaining({ id: 'accessibility-regulation' }), expect.objectContaining({ id: 'accessibility-pdf' }));
    fireEvent.click(screen.getByRole('button', { name: 'Répondre à tous' }));
    const replyDialog = screen.getByRole('dialog', { name: 'Répondre à tous' });
    expect(within(replyDialog).getByLabelText('À')).toHaveValue('direction.generale@mairie.fr');
    expect(within(replyDialog).getByPlaceholderText('Objet du message')).toHaveValue('Re: Nouvelle réglementation - Accessibilité');
  });

  it('archives, restores and permanently deletes messages with confirmation', () => {
    const onMessageAction = jest.fn();
    render(<EmailModule onMessageAction={onMessageAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Archiver' }));
    expect(onMessageAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'accessibility-regulation' }), 'archive');
    fireEvent.click(screen.getByRole('button', { name: /Corbeille/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Restaurer' }));
    expect(onMessageAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'trash-test' }), 'restore');

    fireEvent.click(screen.getByRole('button', { name: /Boîte de réception/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lire Message à supprimer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à la corbeille' }));
    fireEvent.click(screen.getByRole('button', { name: /Corbeille/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer définitivement' }));
    const confirm = screen.getByRole('dialog');
    fireEvent.click(within(confirm).getByRole('button', { name: 'Annuler' }));
    expect(screen.getByRole('heading', { name: 'Message à supprimer' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer définitivement' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer' }));
    expect(onMessageAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'trash-test' }), 'delete-permanently');
  });
});
