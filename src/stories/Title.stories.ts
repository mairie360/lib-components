import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { Title } from './Title';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Text/Title',
  component: Title,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const TitleWithoutSubtitle: Story = {
  args: {
    title: 'Title',
  },
};

export const TitleWithSubtitle: Story = {
  args: {
    title: 'Title',
    subtitle: 'Subtitle',
  },
};

