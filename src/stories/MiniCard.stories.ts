import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { MiniCard } from '../components/MiniCard';

/**
 * Configuration de la story du composant `MiniCard`.
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
 * Cet objet respecte le type `Meta<typeof MiniCard>`.
 */

const meta = {
    title: 'Components/Card/MiniCard',
    component: MiniCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        title: 'Titre de la mini-carte',
        description: 'Description de la mini-carte',
        width: "320px",
        height: "80px",
        label: 'Ouvrir la mini-carte',
    },
} satisfies Meta<typeof MiniCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Titre de la mini-carte',
        description: 'Description de la mini-carte',
        width: "320px",
        height: "180px",
        label: 'Ouvrir la mini-carte',
    },
};
