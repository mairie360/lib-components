import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Rating } from '../components/Rating';

const meta = { title: 'Components/Forms/Rating', component: Rating, tags: ['autodocs'], args: { label: 'Note moyenne', value: 4.8, size: 'm' } } satisfies Meta<typeof Rating>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Display: one star and the mark, for tiles and sheets. */
export const Display: Story = {};
export const DisplaySizes: Story = { render: (args) => <div className="flex items-center gap-6">{(['s', 'm', 'l'] as const).map((size) => <Rating key={size} {...args} size={size} />)}</div> };

function RateCourse() {
  const [value, setValue] = useState(4);
  return <Rating label="Noter cette formation" value={value} onChange={setValue} size="l" />;
}
/** Input: a radiogroup of five stars (arrow keys, visible focus). */
export const Input: Story = { render: () => <RateCourse /> };
export const Disabled: Story = { args: { label: 'Noter cette formation', value: 3, onChange: () => undefined, disabled: true } };
