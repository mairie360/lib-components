import type { Meta, StoryObj } from '@storybook/nextjs';
import { Footer, FooterProps } from '../components/Footer';

const meta: Meta<typeof Footer> = {
  title: 'Components/Navigation/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Default: StoryObj<FooterProps> = {
  args: {
    year: 2026,
    version: '1.0',
    links: [
      { label: 'Support technique' },
      { label: 'Documentation' },
      { label: "Conditions d'utilisation" },
    ],
  },
};

export const WithLinks: StoryObj<FooterProps> = {
  args: {
    year: 2026,
    version: '1.0',
    links: [
      { label: 'Support technique', href: '/support' },
      { label: 'Documentation', href: '/documentation' },
      { label: "Conditions d'utilisation", href: '/conditions' },
    ],
  },
};
