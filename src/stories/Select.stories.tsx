import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
} from "../components/Select";

const meta: Meta<typeof Select> = {
  title: "Components/Select/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;

export const Default: StoryObj<typeof Select> = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sélectionner une option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: StoryObj<typeof Select> = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sélectionner un fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Pomme</SelectItem>
          <SelectItem value="banana">Banane</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Légumes</SelectLabel>
          <SelectItem value="carrot">Carotte</SelectItem>
          <SelectItem value="potato">Pomme de terre</SelectItem>
          <SelectItem value="tomato">Tomate</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const SmallSize: StoryObj<typeof Select> = {
  render: () => (
    <Select>
      <SelectTrigger size="sm" className="w-[180px]">
        <SelectValue placeholder="Petit select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="xs">Très petit</SelectItem>
        <SelectItem value="sm">Petit</SelectItem>
        <SelectItem value="md">Moyen</SelectItem>
        <SelectItem value="lg">Grand</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDefaultValue: StoryObj<typeof Select> = {
  render: () => (
    <Select defaultValue="option2">
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Choisir" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const LongList: StoryObj<typeof Select> = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sélectionner un pays" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="fr">France</SelectItem>
        <SelectItem value="de">Allemagne</SelectItem>
        <SelectItem value="es">Espagne</SelectItem>
        <SelectItem value="it">Italie</SelectItem>
        <SelectItem value="uk">Royaume-Uni</SelectItem>
        <SelectItem value="us">États-Unis</SelectItem>
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="jp">Japon</SelectItem>
        <SelectItem value="cn">Chine</SelectItem>
        <SelectItem value="in">Inde</SelectItem>
      </SelectContent>
    </Select>
  ),
};
