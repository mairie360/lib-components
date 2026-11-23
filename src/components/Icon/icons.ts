import {
  ArrowDown, ArrowUp, ArrowUpDown, ArrowUpRight, AtSign, Ban, Building2, Camera, CheckCheck, CircleAlert, CornerUpLeft,
  FileSpreadsheet, FileUp, FolderKanban, FolderOpen, Hash, Link, ListChecks, LoaderCircle, MessageSquarePlus, MonitorSmartphone,
  RefreshCw, SmilePlus, TextSearch, UserRound, UserRoundMinus, UserRoundPlus, UsersRound, type LucideIcon,
} from 'lucide-react';

/**
 * The lucide glyphs the Figma library publishes as `Icon/<name>` beyond the ones the components import
 * themselves, under their lucide name: `<Icon icon={icons['monitor-smartphone']} />`.
 * MAIR-1108: camera (profile photo) and monitor-smartphone (sessions). MAIR-1151: the Messagerie glyphs
 * (actions, mentions, links, statuses). MAIR-992: at-sign and hash. MAIR-1129: the sort arrows.
 */
export const icons = {
  'arrow-down': ArrowDown,
  'arrow-up': ArrowUp,
  'arrow-up-down': ArrowUpDown,
  'arrow-up-right': ArrowUpRight,
  'at-sign': AtSign,
  ban: Ban,
  'building-2': Building2,
  camera: Camera,
  'check-check': CheckCheck,
  'circle-alert': CircleAlert,
  'corner-up-left': CornerUpLeft,
  'file-spreadsheet': FileSpreadsheet,
  'file-up': FileUp,
  'folder-kanban': FolderKanban,
  'folder-open': FolderOpen,
  hash: Hash,
  link: Link,
  'list-checks': ListChecks,
  'loader-circle': LoaderCircle,
  'message-square-plus': MessageSquarePlus,
  'monitor-smartphone': MonitorSmartphone,
  'refresh-cw': RefreshCw,
  'smile-plus': SmilePlus,
  'text-search': TextSearch,
  'user-round': UserRound,
  'user-round-minus': UserRoundMinus,
  'user-round-plus': UserRoundPlus,
  'users-round': UsersRound,
} as const satisfies Record<string, LucideIcon>;
export type IconName = keyof typeof icons;
