import { render, screen } from '@testing-library/react';
import { Body, Caption, ErrorText, Label, Link, Overline, PageTitle, SectionTitle, Text, TextPresets } from './Text';

describe('Text (MAIR-608, Figma Base/Text)', () => {
  it('binds size, weight and tone to the charte tokens and lets presets choose the element', () => {
    const { container } = render(<>
      <Text size="l" weight="bold" tone="danger">Base</Text>
      <PageTitle>Tableau de bord</PageTitle><SectionTitle>Projets récents</SectionTitle>
      <Body>Corps</Body><Caption>il y a 5 min</Caption><Overline>Colonne</Overline><ErrorText>Champ requis</ErrorText>
      <Label htmlFor="x">Nom</Label><Link href="/aide">Aide</Link>
    </>);
    const base = screen.getByText('Base');
    expect(base.tagName).toBe('SPAN'); expect(base.style.fontSize).toBe('var(--mairie-text-l)'); expect(base).toHaveClass('font-bold'); expect(base.style.color).toBe('var(--mairie-error-text)');
    expect(screen.getByRole('heading', { level: 1, name: 'Tableau de bord' })).toHaveAttribute('data-preset', 'PageTitle');
    expect(screen.getByRole('heading', { level: 2, name: 'Projets récents' })).toBeInTheDocument();
    expect(screen.getByText('Corps').tagName).toBe('P');
    expect(screen.getByText('Colonne')).toHaveClass('uppercase');
    expect(screen.getByText('Champ requis').style.color).toBe('var(--mairie-error-text)');
    expect(screen.getByText('Nom').tagName).toBe('LABEL');
    expect(screen.getByRole('link', { name: 'Aide' })).toHaveAttribute('href', '/aide');
    expect(container.querySelectorAll('[data-size]')).toHaveLength(9);
    expect(Object.keys(TextPresets)).toHaveLength(13);
  });
  it('keeps the preset defaults when an override is undefined and overrides them otherwise', () => {
    render(<><PageTitle size={undefined}>A</PageTitle><PageTitle as="h2" tone="muted">B</PageTitle></>);
    expect(screen.getByText('A').style.fontSize).toBe('var(--mairie-text-xl)');
    expect(screen.getByText('B').tagName).toBe('H2'); expect(screen.getByText('B').style.color).toBe('var(--mairie-muted)');
  });
  it('merges consumer classes on a link (CodeRabbit on #467)', () => {
    render(<Link href="/aide" className="ml-2">Aide</Link>);
    expect(screen.getByRole('link', { name: 'Aide' })).toHaveClass('ml-2', 'underline');
  });
});
