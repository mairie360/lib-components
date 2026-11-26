import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolTip } from './ToolTip';

const renderTooltip = () =>
  render(
    <ToolTip text="Tooltip content">
      <button type="button">Hover me</button>
    </ToolTip>
  );

describe('ToolTip component', () => {
  it('renders child element', () => {
    renderTooltip();
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show tooltip text initially', () => {
    renderTooltip();
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(screen.getByText('Tooltip content')).not.toBeVisible();
  });

  it('shows tooltip text on mouse enter and hides on mouse leave', () => {
    renderTooltip();
    const trigger = screen.getByText('Hover me');

    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip content');

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  describe('MAIR-473 RGAA 10.13 / 12.11', () => {
    it('shows the tooltip on keyboard focus and hides it on blur', () => {
      renderTooltip();
      const trigger = screen.getByRole('button', { name: 'Hover me' });

      fireEvent.focus(trigger);
      expect(screen.getByRole('tooltip')).toBeVisible();

      fireEvent.blur(trigger);
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('hides the tooltip on Escape wherever the focus is', () => {
      renderTooltip();
      fireEvent.mouseEnter(screen.getByText('Hover me'));
      expect(screen.getByRole('tooltip')).toBeVisible();

      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('stays shown while the pointer crosses the gap to the bubble: the gap is padding of the tooltip, not a margin', () => {
      renderTooltip();
      fireEvent.mouseEnter(screen.getByText('Hover me'));
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('pb-2');
      expect(tooltip.className).not.toMatch(/\bm[bt]?-\d/);
      fireEvent.mouseOver(tooltip);
      expect(screen.getByRole('tooltip')).toBeVisible();
    });

    it('stays shown when the pointer leaves while the trigger keeps the focus (CodeRabbit on #508)', () => {
      renderTooltip();
      const trigger = screen.getByRole('button', { name: 'Hover me' });
      fireEvent.focus(trigger);
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
      expect(screen.getByRole('tooltip')).toBeVisible();
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('describes the trigger with the tooltip and keeps an existing description', () => {
      render(
        <ToolTip text="Tooltip content">
          <button type="button" aria-describedby="other">Hover me</button>
        </ToolTip>
      );
      const trigger = screen.getByRole('button', { name: 'Hover me' });
      const ids = trigger.getAttribute('aria-describedby')?.split(' ') ?? [];
      expect(ids[0]).toBe('other');
      expect(document.getElementById(ids[1])).toHaveTextContent('Tooltip content');
    });
  });

  it('MAIR-1095 shows at once with the 80 ms fade on the neutral solid tokens', () => {
    renderTooltip();
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    const bubble = screen.getByRole('tooltip').firstElementChild as HTMLElement;
    expect(bubble).toHaveClass('mairie-tooltip-bubble', 'bg-[var(--mairie-neutral-action)]', 'text-[var(--mairie-on-neutral)]');
    const css = readFileSync(join(__dirname, '../../styles/municipal-theme.css'), 'utf8');
    expect(css).toMatch(/\.mairie-tooltip-bubble \{ animation: mairie-tooltip-in var\(--mairie-motion-instant\) var\(--mairie-ease-standard\) var\(--mairie-tooltip-delay\) both; \}/);
    expect(css).toContain('--mairie-tooltip-delay: 0ms;');
  });

  it('MAIR-1225 sits above and from the start of the trigger by default', () => {
    render(<ToolTip text="Info"><button type="button">Trigger</button></ToolTip>);
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('bottom-full', 'pb-2', 'left-0');
    expect(tooltip).toHaveAttribute('data-placement', 'top');
  });

  it('MAIR-1225 sits under the trigger and lines up with its end when asked, still bridging the gap with padding', () => {
    render(<ToolTip text="Nouvelle conversation" placement="bottom" align="end"><button type="button">+</button></ToolTip>);
    fireEvent.mouseEnter(screen.getByRole('button', { name: '+' }));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('top-full', 'pt-2', 'right-0');
    expect(tooltip).not.toHaveClass('bottom-full');
    expect(tooltip.className).not.toMatch(/\bm[bt]?-\d/);
    expect(tooltip).toHaveAttribute('data-placement', 'bottom');
    expect(tooltip).toHaveAttribute('data-align', 'end');
  });
});
