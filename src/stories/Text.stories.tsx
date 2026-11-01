import type { Meta, StoryObj } from '@storybook/react-vite';

import { Body, BodySmall, Caption, ErrorText, Help, Label, Link, Metric, ModalTitle, Overline, PageTitle, PanelTitle, SectionTitle, Text } from '../components/Text';
import { sizes } from '../kit/theme';

const meta = { title: 'Components/Primitives/Text', component: Text, tags: ['autodocs'], args: { children: 'Texte', size: 'm', weight: 'regular', tone: 'default' } } satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Sizes: Story = { render: (args) => <div className="flex flex-col gap-2">{sizes.map((size) => <Text key={size} {...args} size={size}>{`Taille ${size}`}</Text>)}</div> };
export const Tones: Story = { render: (args) => <div className="flex flex-wrap gap-3">{(['default', 'muted', 'primary', 'secondary', 'success', 'warning', 'danger'] as const).map((tone) => <Text key={tone} {...args} tone={tone} weight="medium">{tone}</Text>)}</div> };
/** The presets a front uses first: each one fixes the element, size, weight and tone (Figma Text/*). */
export const Presets: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <PageTitle>Tableau de bord</PageTitle><SectionTitle>Projets récents</SectionTitle><PanelTitle>Voirie – rue des Lilas</PanelTitle><ModalTitle>Nouveau projet</ModalTitle>
      <Body>Texte courant d’un paragraphe.</Body><BodySmall>Texte secondaire d’une cellule.</BodySmall><Help>Aide sous un champ.</Help><ErrorText>Le prénom est obligatoire.</ErrorText>
      <Caption>Mis à jour il y a 5 min</Caption><Label>Adresse e-mail</Label><Overline>Colonne</Overline><Link href="#">Voir la fiche</Link><Metric>1 284</Metric>
    </div>
  ),
};
