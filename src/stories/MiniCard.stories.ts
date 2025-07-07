import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { MiniCard } from '../components/MiniCard';

/**
 * Meta configuration for the `MiniCard` component story.
 *
 * This configuration is used by Storybook's autodocs feature to generate
 * documentation for the `MiniCard` component. It includes the following:
 *
 * - **title**: Specifies the category and name of the story (`Example/MiniCard`).
 * - **component**: The component being documented (`MiniCard`).
 * - **tags**: Tags used for Storybook features (e.g., `autodocs`).
 * - **parameters**: Additional Storybook parameters, such as layout settings.
 * - **args**: Default arguments (props) for the `MiniCard` component:
 *   - `title`: The title of the mini card (default: `'Mini Card Title'`).
 *   - `description`: A description of the mini card (default: `'Mini Card Description'`).
 *   - `width`: The width of the mini card (default: `'320px'`).
 *   - `height`: The height of the mini card (default: `'80px'`).
 *
 * This meta object satisfies the `Meta<typeof MiniCard>` type, ensuring type safety.
 */

const meta = {
    title: 'Components/Card/MiniCard',
    component: MiniCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        title: 'Mini Card Title',
        description: 'Mini Card Description',
        width: "320px",
        height: "80px",
        label: 'Open Mini Card',
    },
} satisfies Meta<typeof MiniCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Mini Card Title',
        description: 'Mini Card Description',
        width: "320px",
        height: "180px",
        label: 'Open Mini Card',
    },
};