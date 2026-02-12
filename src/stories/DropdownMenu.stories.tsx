import type { Meta, StoryObj } from "@storybook/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../components/DropdownMenu";
import { MoreHorizontal } from "lucide-react";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
};

export default meta;

export const Default: StoryObj<typeof DropdownMenu> = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-4 py-2 text-gray-700 rounded">
        <MoreHorizontal size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Option 1</DropdownMenuItem>
        <DropdownMenuItem>Option 2</DropdownMenuItem>
        <DropdownMenuItem>Option 3</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithLabel: StoryObj<typeof DropdownMenu> = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-4 py-2 bg-green-500 text-white rounded">
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Mon Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Modifier</DropdownMenuItem>
        <DropdownMenuItem>Dupliquer</DropdownMenuItem>
        <DropdownMenuItem>Partager</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithDeleteAction: StoryObj<typeof DropdownMenu> = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-4 py-2 bg-gray-700 text-white rounded">
        Options
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Voir les détails</DropdownMenuItem>
        <DropdownMenuItem>Modifier</DropdownMenuItem>
        <DropdownMenuItem>Dupliquer</DropdownMenuItem>
        <DropdownMenuItem>Supprimer</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithIcons: StoryObj<typeof DropdownMenu> = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-4 py-2 bg-purple-500 text-white rounded">
        Menu avec icônes
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>📁 Nouveau dossier</DropdownMenuItem>
        <DropdownMenuItem>📄 Nouveau fichier</DropdownMenuItem>
        <DropdownMenuItem>⚙️ Paramètres</DropdownMenuItem>
        <DropdownMenuItem>Supprimer</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
