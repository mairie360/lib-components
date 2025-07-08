import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolTip } from '../components/ToolTip';

describe('ToolTip component', () => {
  it('renders child element', () => {
    render(
      <ToolTip text="Tooltip content">
        <button>Hover me</button>
      </ToolTip>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show tooltip text initially', () => {
    render(
      <ToolTip text="Tooltip content">
        <button>Hover me</button>
      </ToolTip>
    );
    expect(screen.queryByText('Tooltip content')).toBeNull();
  });

  it('shows tooltip text on mouse enter and hides on mouse leave', () => {
    render(
      <ToolTip text="Tooltip content">
        <button>Hover me</button>
      </ToolTip>
    );

    const trigger = screen.getByText('Hover me');

    expect(screen.queryByText('Tooltip content')).toBeNull();

    fireEvent.mouseEnter(trigger);
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText('Tooltip content')).toBeNull();
  });
});
