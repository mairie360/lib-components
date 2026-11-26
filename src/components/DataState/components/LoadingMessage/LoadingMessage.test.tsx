import { render, screen } from '@testing-library/react';
import { LoadingMessage } from './LoadingMessage';

describe('LoadingMessage (MAIR-1221)', () => {
  it('renders nothing on its first pass, then its message, visually hidden', () => {
    const { renderToStaticMarkup } = jest.requireActual<typeof import('react-dom/server')>('react-dom/server');
    expect(renderToStaticMarkup(<LoadingMessage message="Chargement du groupe…" />)).toBe('<span class="sr-only"></span>');
    render(<LoadingMessage message="Chargement du groupe…" />);
    expect(screen.getByText('Chargement du groupe…')).toHaveClass('sr-only');
  });
});
