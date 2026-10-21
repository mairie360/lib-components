import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Skeleton } from './Skeleton';

it('keeps decorative skeletons silent and announces only a supplied loading label', async () => {
  const { container, rerender } = render(<Skeleton data-testid="skeleton" />);
  expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  rerender(<Skeleton label="Chargement des dossiers" />);
  expect(screen.getByRole('status')).toHaveTextContent('Chargement des dossiers');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect((await axe(container)).violations).toEqual([]);
});

it('shimmers only for users allowing motion and offers the Figma shapes and presets (MAIR-608)', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles/municipal-theme.css'), 'utf8');
  const motion = css.slice(css.indexOf('.mairie-skeleton-animated'));
  expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.mairie-skeleton-animated/);
  expect(motion).toContain('animation: mairie-shimmer');
  const { container, rerender } = render(<Skeleton shape="circle" size="l" />);
  const bone = container.querySelector('[aria-hidden]') as HTMLElement;
  expect(bone).toHaveClass('mairie-skeleton-animated'); expect(bone).toHaveAttribute('data-shape', 'circle');
  expect(bone.style.width).toBe('var(--mairie-avatar-l)');
  rerender(<Skeleton animated={false} />);
  expect(container.querySelector('[aria-hidden]')).not.toHaveClass('mairie-skeleton-animated');
  rerender(<Skeleton.UserIdentity label="Chargement de l’agent" />);
  expect(screen.getByRole('status')).toHaveTextContent('Chargement de l’agent');
  expect(container.querySelectorAll('[data-shape="circle"]')).toHaveLength(1);
  rerender(<Skeleton.TableRow columns={3} />);
  expect(container.querySelectorAll('[data-shape="line"]')).toHaveLength(3);
});

it('lays the table-row skeleton in columns (CodeRabbit on #467)', () => {
  const { container } = render(<Skeleton.TableRow columns={3} />);
  expect((container.firstChild as HTMLElement).style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
});
