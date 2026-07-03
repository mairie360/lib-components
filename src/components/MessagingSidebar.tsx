import React from 'react';
import { MessageSquare, Search, UserRound, UsersRound } from 'lucide-react';

import { joinClasses } from './calendar/style';
import { MessagingConversationItem } from './MessagingConversationItem';
import type { MessagingContactId, MessagingConversation } from './messaging/types';

export interface MessagingSidebarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  conversations: MessagingConversation[];
  activeConversationId?: MessagingContactId;
  title?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  newMessageLabel?: string;
  createGroupLabel?: string;
  availableUsersLabel?: string;
  showAvailableUsers?: boolean;
  emptyLabel?: React.ReactNode;
  onSearchValueChange?: (value: string) => void;
  onConversationSelect?: (conversation: MessagingConversation) => void;
  onNewMessageClick?: () => void;
  onCreateGroupClick?: () => void;
}

const normalize = (value: React.ReactNode) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const MessagingSidebar = ({
  conversations,
  activeConversationId,
  title = 'Messagerie interne',
  searchPlaceholder = 'Rechercher un contact...',
  searchValue,
  newMessageLabel = 'Nouveau message',
  createGroupLabel = 'Créer un groupe',
  availableUsersLabel = 'Utilisateurs disponibles',
  showAvailableUsers = true,
  emptyLabel = 'Aucune conversation trouvée.',
  onSearchValueChange,
  onConversationSelect,
  onNewMessageClick,
  onCreateGroupClick,
  className = '',
  ...props
}: MessagingSidebarProps) => {
  const [internalSearch, setInternalSearch] = React.useState('');
  const currentSearch = searchValue ?? internalSearch;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (searchValue === undefined) {
      setInternalSearch(nextValue);
    }

    onSearchValueChange?.(nextValue);
  };

  const filteredConversations = conversations.filter((conversation) => {
    const haystack = normalize(
      `${conversation.name} ${conversation.department ?? ''} ${conversation.lastMessage ?? ''}`
    );

    return haystack.includes(normalize(currentSearch));
  });
  const filteredAvailableUsers = filteredConversations.filter((conversation) => conversation.kind !== 'group');

  return (
    <aside
      className={joinClasses(
        'flex min-h-0 flex-col border-b border-[#d8d2ca] bg-[#f5f3f0] p-4 text-[#172033] lg:border-b-0 lg:border-r',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="truncate text-lg font-bold leading-7">{title}</h2>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            aria-label={newMessageLabel}
            title={newMessageLabel}
            className="inline-flex size-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-white text-[#172033] transition hover:bg-[#fbfaf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
            onClick={onNewMessageClick}
          >
            <MessageSquare className="size-4" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label={createGroupLabel}
            title={createGroupLabel}
            className="inline-flex size-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-white text-[#172033] transition hover:bg-[#fbfaf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
            onClick={onCreateGroupClick}
          >
            <UsersRound className="size-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <label className="relative mt-4 block">
        <span className="sr-only">{searchPlaceholder}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b7280]" />
        <input
          type="search"
          value={currentSearch}
          placeholder={searchPlaceholder}
          className="h-9 w-full rounded-md border border-[#d8d2ca] bg-white pl-10 pr-3 text-sm text-[#172033] outline-none transition placeholder:text-[#6b7280] focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20"
          onChange={handleSearchChange}
        />
      </label>

      {showAvailableUsers && filteredAvailableUsers.length > 0 && (
        <section className="mt-4" aria-label={availableUsersLabel}>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#5f6770]">
            <UserRound className="size-3.5" strokeWidth={1.8} />
            <span>{availableUsersLabel}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filteredAvailableUsers.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                aria-label={`Ouvrir la discussion avec ${conversation.name}`}
                className={joinClasses(
                  'inline-flex max-w-[160px] shrink-0 items-center gap-2 rounded-md border bg-white px-2.5 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30',
                  conversation.id === activeConversationId
                    ? 'border-[#1256a6] bg-[#e4f2f1] text-[#172033]'
                    : 'border-[#d8d2ca] text-[#2f3747] hover:border-[#b9d6d5] hover:bg-[#fbfaf9]'
                )}
                onClick={() => onConversationSelect?.(conversation)}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold leading-5">{conversation.name}</span>
                  {conversation.department && (
                    <span className="block truncate text-xs leading-4 text-[#5f6770]">
                      {conversation.department}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6 min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <MessagingConversationItem
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === activeConversationId}
              onClick={() => onConversationSelect?.(conversation)}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[#d8d2ca] bg-white p-4 text-center text-sm text-[#5f6770]">
            {emptyLabel}
          </div>
        )}
      </div>
    </aside>
  );
};
