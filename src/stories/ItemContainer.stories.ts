import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { ItemContainer } from '../components/ItemContainer';

/**
 * Configuration de la story du composant `ItemContainer`.
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
 * Cet objet respecte le type `Meta<typeof ItemContainer>`.
 */

const meta = {
    title: 'Components/Items/ItemContainer',
    component: ItemContainer,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        title: 'Mon conteneur',
        statusColor: 'bg-green-500',
        items: [
            { id: '1', title: 'Élément 1', description: 'Description de l’élément 1' },
            { id: '2', title: 'Élément 2', description: 'Description de l’élément 2' },
            { id: '3', title: 'Élément 3', description: 'Description de l’élément 3' },
        ],
    },
    argTypes: {
        title: { control: false },
    },
} satisfies Meta<typeof ItemContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Mon conteneur',
        statusColor: 'bg-green-500',
        items: [
            { id: '1', title: 'Élément 1', description: 'Description de l’élément 1' },
            { id: '2', title: 'Élément 2', description: 'Description de l’élément 2' },
            { id: '3', title: 'Élément 3', description: 'Description de l’élément 3' },
        ],
    },
};
