'use client';

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { InputManager } from './InputManager';

const meta = {
  title: 'Components/Inputs/InputManager',
  component: InputManager,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InputManager>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * This story demonstrates the `InputManager` component with various input types.
 * It includes text inputs, a checkbox input, and a select input.
 * Each input type is managed with its own state and change handler.
 * The `InputManager` component is designed to handle different input types dynamically.
 * The story showcases how to use the `InputManager` to render and manage form inputs.
 * It is useful for building forms with multiple input types in a consistent way.
 */

export const TextInputs: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
    });

    const handleChange = (name: string, value: any) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const inputs = [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        value: formData.username,
        onChange: handleChange,
      },
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        value: formData.email,
        onChange: handleChange,
      },
    ];

    return <InputManager inputs={inputs} />;
  },
  parameters: {
    docs: {
      source: {
        code: `
const [formData, setFormData] = useState({
      username: '',
      email: '',
    });

    const handleChange = (name: string, value: any) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const inputs = [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        value: formData.username,
        onChange: handleChange,
      },
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        value: formData.email,
        onChange: handleChange,
      },
    ];

    return <InputManager inputs={inputs} />;
        `,
      },
    },
  },
};

export const CheckboxInput: Story = {
  render: () => {
    const [subscribe, setSubscribe] = useState(false);

    const handleChange = (name: string, value: any) => {
      setSubscribe(value);
    };

    const inputs = [
      {
        name: 'subscribe',
        label: 'Subscribe to newsletter',
        type: 'checkbox',
        value: subscribe,
        onChange: handleChange,
      },
    ];

    return <InputManager inputs={inputs} />;
  },
  parameters: {
    docs: {
      source: {
        code: `
const [subscribe, setSubscribe] = useState(false);

    const handleChange = (name: string, value: any) => {
      setSubscribe(value);
    };

    const inputs = [
      {
        name: 'subscribe',
        label: 'Subscribe to newsletter',
        type: 'checkbox',
        value: subscribe,
        onChange: handleChange,
      },
    ];

    return <InputManager inputs={inputs} />;
        `,
      },
    },
  },
};

export const SelectInput: Story = {
  render: () => {
    const [country, setCountry] = useState('fr');

    const handleChange = (name: string, value: any) => {
      setCountry(value);
    };

    const inputs = [
      {
        name: 'country',
        label: 'Country',
        type: 'select',
        value: country,
        onChange: handleChange,
        options: [
          { label: 'France', value: 'fr' },
          { label: 'USA', value: 'us' },
          { label: 'Germany', value: 'de' },
        ],
      },
    ];

    return <InputManager inputs={inputs} />;
  },
  parameters: {
    docs: {
      source: {
        code: `
const [country, setCountry] = useState('fr');
    const handleChange = (name: string, value: any) => {
      setCountry(value);
    };

    const inputs = [
      {
        name: 'country',
        label: 'Country',
        type: 'select',
        value: country,
        onChange: handleChange,
        options: [
          { label: 'France', value: 'fr' },
          { label: 'USA', value: 'us' },
          { label: 'Germany', value: 'de' },
        ],
      },
    ];

    return <InputManager inputs={inputs} />;
        `,
      },
    },
  },
};

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Pear', value: 'pear' },
  { label: 'Pineapple', value: 'pineapple' },
];


export const DemoSearch = {
  render: () => {
    const [search, setSearch] = useState('');

    const onChange = (name: string, value: any) => {
      setSearch(value);
    };

    const inputs = [
      {
        name: 'fruit',
        label: 'Choose a fruit',
        type: 'search' as const,
        value: search,
        onChange,
        options: fruits,
      },
    ];

    return <InputManager inputs={inputs} />;
  },
  parameters: {
    docs: {
      source: {
        code: `
const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Pear', value: 'pear' },
  { label: 'Pineapple', value: 'pineapple' },
];

const DemoSearch = () => {
  const [search, setSearch] = React.useState('');

  const onChange = (name, value) => {
    setSearch(value);
  };

  const inputs = [
    {
      name: 'fruit',
      label: 'Choose a fruit',
      type: 'search',
      value: search,
      onChange,
      options: fruits,
    },
  ];

  return <InputManager inputs={inputs} />;
};
        `,
      },
      description: {
        story: `
This example demonstrates how to use the \`InputManager\` component
to create a search input with predefined options.
It allows users to search for fruits from a predefined list.
The search input filters the options based on user input.
The component manages the search state and updates the input value accordingly.
Here is an example of a list to pass as options to the search input.
You can modify the list to include any items you want to search for.
        `,
      },
    },
  },
};




