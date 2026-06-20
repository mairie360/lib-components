import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { Item } from '../components/Item';


/**
 * Configuration de la story du composant `Item`.
 *
 * Cette configuration est utilisée par Storybook Autodocs pour générer
 * la documentation du composant. Elle inclut :
 *
 * - **title** : la catégorie et le nom de la story.
 * - **component** : le composant documenté.
 * - **tags** : les fonctionnalités Storybook activées.
 * - **parameters** : les paramètres d’affichage.
 * - **args** : les props par défaut du composant.
 *
 * Cet objet respecte le type `Meta<typeof Item>`.
 * 
 * L’élément contient deux boutons : supprimer et modifier.
 */
const meta = {
    title: 'Components/Items/Item',
    component: Item,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        title: 'Titre de l’élément',
        description: 'Description de l’élément',
        width: "320px", 
        height: "80px",
    },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
            title: 'Titre de l’élément',
            description: 'Description de l’élément',
            width: "320px", 
            height: "80px",
    },
};
