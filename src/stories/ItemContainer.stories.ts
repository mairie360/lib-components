import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { ItemContainer } from '../components/ItemContainer';

/**
 * Meta configuration for the `ItemContainer` component story.
 *
 * This configuration is used by Storybook's autodocs feature to generate
 * documentation for the `ItemContainer` component. It includes the following:
 *
 * - **title**: Specifies the category and name of the story (`Example/ItemContainer`).
 * - **component**: The component being documented (`ItemContainer`).
 * - **tags**: Tags used for Storybook features (e.g., `autodocs`).
 * - **parameters**: Additional Storybook parameters, such as layout settings.
 * - **args**: Default arguments (props) for the `ItemContainer` component:
 *   - `title`: The title of the container (default: `'My Container'`).
 *   - `statusColor`: The status color of the container (default: `'bg-green-500'`).
 *   - `items`: An array of items to display in the container.
 *
 * This meta object satisfies the `Meta<typeof ItemContainer>` type, ensuring type safety.
 */

const meta = {
    title: 'Components/Items/ItemContainer',
    component: ItemContainer,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        title: 'My Container',
        statusColor: 'bg-green-500',
        items: [
            { id: '1', title: 'Item 1', description: 'Description for Item 1' },
            { id: '2', title: 'Item 2', description: 'Description for Item 2' },
            { id: '3', title: 'Item 3', description: 'Description for Item 3' },
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
        title: 'My Container',
        statusColor: 'bg-green-500',
        items: [
            { id: '1', title: 'Item 1', description: 'Description for Item 1' },
            { id: '2', title: 'Item 2', description: 'Description for Item 2' },
            { id: '3', title: 'Item 3', description: 'Description for Item 3' },
        ],
    },
};