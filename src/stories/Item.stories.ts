import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { Item } from './Item';


/**
 * Meta configuration for the `Item` component story.
 *
 * This configuration is used by Storybook's autodocs feature to generate
 * documentation for the `Item` component. It includes the following:
 *
 * - **title**: Specifies the category and name of the story (`Example/Item`).
 * - **component**: The component being documented (`Item`).
 * - **tags**: Tags used for Storybook features (e.g., `autodocs`).
 * - **parameters**: Additional Storybook parameters, such as layout settings.
 * - **args**: Default arguments (props) for the `Item` component:
 *   - `title`: The title of the item (default: `'Item Title'`).
 *   - `description`: A description of the item (default: `'Item Description'`).
 *   - `width`: The width of the item (default: `'320px'`).
 *   - `height`: The height of the item (default: `'80px'`).
 *
 * This meta object satisfies the `Meta<typeof Item>` type, ensuring type safety.
 * 
 * The item contains two buttons: delete and modify. The modify button should navigate to the modification page.
 */
const meta = {
    title: 'Example/Item',
    component: Item,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        title: 'Item Title',
        description: 'Item Description',
        width: "320px", 
        height: "80px",
    },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
            title: 'Item Title',
            description: 'Item Description',
            width: "320px", 
            height: "80px",
    },
};
