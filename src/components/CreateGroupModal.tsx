import React from 'react';
import { UsersRound } from 'lucide-react';

import { joinClasses } from './calendar/style';
import { MessagingModalFrame } from './messaging/MessagingModalFrame';
import type { CreateGroupPayload, MessagingContactId, MessagingConversation } from './messaging/types';

export interface CreateGroupModalProps {
  isOpen: boolean;
  members: MessagingConversation[];
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  nameLabel?: string;
  namePlaceholder?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  membersLabel?: string;
  cancelLabel?: string;
  submitLabel?: string;
  initialName?: string;
  initialDescription?: string;
  initialMemberIds?: MessagingContactId[];
  onCancel: () => void;
  onCreateGroup: (payload: CreateGroupPayload) => void;
}

const fieldClassName =
  'h-9 w-full rounded-md border border-[#d8d2ca] bg-white px-3 text-sm text-[#172033] outline-none transition placeholder:text-[#6b7280] focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20';

const buttonSecondaryClassName =
  'inline-flex h-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-white px-4 text-sm font-semibold text-[#172033] shadow-sm transition hover:bg-[#fbfaf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/25';

const buttonPrimaryClassName =
  'inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#1256a6] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4b91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35 disabled:cursor-not-allowed disabled:bg-[#b7cce3]';

const emptyMemberIds: MessagingContactId[] = [];

export const CreateGroupModal = ({
  isOpen,
  members,
  title = 'Créer un groupe',
  subtitle = 'Créer un groupe de discussion avec plusieurs membres',
  nameLabel = 'Nom du groupe',
  namePlaceholder = 'Nom du groupe',
  descriptionLabel = 'Description (optionnel)',
  descriptionPlaceholder = 'Description du groupe',
  membersLabel = 'Membres',
  cancelLabel = 'Annuler',
  submitLabel = 'Créer le groupe',
  initialName = '',
  initialDescription = '',
  initialMemberIds = emptyMemberIds,
  onCancel,
  onCreateGroup,
}: CreateGroupModalProps) => {
  const initialMemberValues = initialMemberIds.map((memberId) => String(memberId));
  const initialMemberValuesKey = initialMemberValues.join('\u0000');
  const [name, setName] = React.useState(initialName);
  const [description, setDescription] = React.useState(initialDescription);
  const [selectedMemberValues, setSelectedMemberValues] = React.useState(() => initialMemberValues);
  const titleId = React.useId();
  const subtitleId = React.useId();
  const nameId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    if (!isOpen) return;

    setName(initialName);
    setDescription(initialDescription);
    setSelectedMemberValues(initialMemberValues);
  }, [initialDescription, initialMemberValuesKey, initialName, isOpen]);

  if (!isOpen) return null;

  const selectedMembers = members.filter((member) => selectedMemberValues.includes(String(member.id)));
  const canSubmit = name.trim().length > 0 && selectedMembers.length > 0;

  const toggleMember = (memberId: MessagingContactId) => {
    const memberValue = String(memberId);

    setSelectedMemberValues((currentValues) =>
      currentValues.includes(memberValue)
        ? currentValues.filter((value) => value !== memberValue)
        : [...currentValues, memberValue]
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    onCreateGroup({
      name: name.trim(),
      description: description.trim() || undefined,
      memberIds: selectedMembers.map((member) => member.id),
    });
  };

  return (
    <MessagingModalFrame
      title={title}
      subtitle={subtitle}
      titleId={titleId}
      subtitleId={subtitleId}
      onClose={onCancel}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" className={buttonSecondaryClassName} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="submit" className={buttonPrimaryClassName} disabled={!canSubmit}>
            <UsersRound className="size-4" strokeWidth={1.8} />
            <span>{submitLabel}</span>
          </button>
        </>
      }
    >
      <div>
        <label htmlFor={nameId} className="mb-1 block text-sm font-semibold leading-5 text-[#2f3747]">
          {nameLabel}
        </label>
        <input
          id={nameId}
          type="text"
          value={name}
          placeholder={namePlaceholder}
          className={fieldClassName}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor={descriptionId} className="mb-1 block text-sm font-semibold leading-5 text-[#2f3747]">
          {descriptionLabel}
        </label>
        <input
          id={descriptionId}
          type="text"
          value={description}
          placeholder={descriptionPlaceholder}
          className={fieldClassName}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <fieldset>
        <legend className="mb-1 block text-sm font-semibold leading-5 text-[#2f3747]">{membersLabel}</legend>
        <div className="max-h-48 overflow-y-auto rounded-md border border-[#d8d2ca] bg-white py-2 pr-1">
          {members.map((member) => {
            const checked = selectedMemberValues.includes(String(member.id));

            return (
              <label
                key={member.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 px-5 text-sm text-[#2f3747] transition hover:bg-[#fbfaf9]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  className={joinClasses(
                    'size-4 rounded border-[#d8d2ca] text-[#1256a6] focus:ring-[#1256a6]/30',
                    checked ? 'accent-[#1256a6]' : ''
                  )}
                  onChange={() => toggleMember(member.id)}
                />
                <span>
                  {member.name}
                  {member.department ? ` - ${member.department}` : ''}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </MessagingModalFrame>
  );
};
