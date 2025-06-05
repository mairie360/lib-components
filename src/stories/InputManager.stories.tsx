import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import InputManager from "./InputManager";
import type { InputProps } from "./InputManager";

const meta: Meta<typeof InputManager> = {
  title: "Components/Input/InputManager",
  component: InputManager,
  args: {
    table: "exampleTable",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof InputManager>;

const Template = (args: any) => {
  const [value, setValue] = useState(args.value || "");

  const handleChange = (e: React.ChangeEvent<any>) => {
  const { type, checked, value } = e.target;

  const finalValue = type === "checkbox" ? checked : value;
  setValue(finalValue);
};


  return <InputManager {...args} value={value} onChange={handleChange} />;
};

export const Textarea: Story = {
  render: (args) => <Template {...args} />,
  args: {
    label: "Description",
    type: "text",
    name: "description",
    value: "Texte d'exemple",
  },
};

export const Select: Story = {
  render: (args) => <Template {...args} />,
  args: {
    label: "Choisir une option",
    type: "select",
    name: "selectInput",
    options: [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
    ],
    value: "option1",
  },
};

export const Radio: Story = {
  render: (args) => <Template {...args} />,
  args: {
    label: "Choisir une option",
    type: "radio",
    name: "radioInput",
    options: [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
      { value: "option3", label: "Option 3" },
    ],
    value: "option1",
  },
};

export const FileInput: Story = {
  render: (args) => <Template {...args} />,
  args: {
    label: "Ajouter un fichier",
    type: "file",
    name: "document",
    value: "https://example.com/uploads/file.pdf",
  },
};

export const DateInput: Story = {
  render: (args) => <Template {...args} />,
  args: {
    label: "Date de naissance",
    type: "date",
    name: "birthdate",
    value: "01-01-1990",
  },
};

export const Checkbox: Story = {
  render: (args) => <Template {...args} />,
  args: {
    label: "Accepter les conditions",
    type: "checkbox",
    name: "terms",
    value: true,
  },
};

export const NumberInput: Story = {
  render: (args) => <Template {...args} />,
  args: {
    label: "Quantité",
    type: "number",
    name: "quantity",
    value: 10,
    min: 1,
    max: 100,
    error: "La quantité doit être entre 1 et 100.",
  },
};

export const PasswordInput: Story = {
  render: (args) => <Template {...args} />,
  args: {
    label: "Mot de passe",
    type: "password",
    name: "password",
    value: "secret",
  },
};

export const EmailInput: Story = {
  render: (args) => <Template {...args} />,
  args: {
    label: "Email",
    type: "email",
    name: "email",
    value: "",
  },
};

export const TelephoneInput: Story = {
  render: (args) => <Template {...args} />,
  args: {
    label: "Téléphone",
    type: "telephone",
    name: "phone",
    value: "+33123456789",
  },
};

export const DefaultInput: Story = {
  render: (args) => <Template {...args} />,
  args: {
    label: "Nom",
    type: "text",
    name: "username",
    value: "Jean Dupont",
  },
};
