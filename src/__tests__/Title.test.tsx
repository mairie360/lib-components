import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Title } from '../components/Title';

describe('Title component', () => {
  it('renders the title text', () => {
    render(<Title title="Main Title" />);
    expect(screen.getByText('Main Title')).toBeInTheDocument();
  });

  it('renders the subtitle if provided', () => {
    render(<Title title="Main Title" subtitle="Subtitle here" />);
    expect(screen.getByText('Subtitle here')).toBeInTheDocument();
  });

  it('does not render subtitle if not provided', () => {
    render(<Title title="Main Title" />);
    const subtitle = screen.queryByText(/./);
    expect(screen.queryByText('Subtitle here')).not.toBeInTheDocument();
  });

  it('applies default styles for title and subtitle', () => {
    render(<Title title="Styled Title" subtitle="Styled Subtitle" />);
    const title = screen.getByText('Styled Title');
    const subtitle = screen.getByText('Styled Subtitle');

    expect(title).toHaveClass('text-2xl');
    expect(title).toHaveClass('font-bold');
    expect(subtitle).toHaveClass('text-gray-500');
    expect(subtitle).toHaveClass('text-sm');
    expect(subtitle).toHaveClass('font-normal');
  });

  it('applies custom styles for title and subtitle', () => {
    render(
      <Title
        title="Custom Title"
        subtitle="Custom Subtitle"
        titleColor="text-red-500"
        subtitleColor="text-blue-400"
        titleFontSize="text-xl"
        subtitleFontSize="text-xs"
        titleFontWeight="font-semibold"
        subtitleFontWeight="font-light"
      />
    );
    const title = screen.getByText('Custom Title');
    const subtitle = screen.getByText('Custom Subtitle');

    expect(title).toHaveClass('text-red-500');
    expect(title).toHaveClass('text-xl');
    expect(title).toHaveClass('font-semibold');

    expect(subtitle).toHaveClass('text-blue-400');
    expect(subtitle).toHaveClass('text-xs');
    expect(subtitle).toHaveClass('font-light');
  });

  it('calls onClick when title is clicked', () => {
    const onClick = jest.fn();
    render(<Title title="Clickable Title" onClick={onClick} />);
    const title = screen.getByText('Clickable Title');
    fireEvent.click(title);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('passes additional props to the title element', () => {
    render(<Title title="With id" id="title1" data-testid="title-test" />);
    const title = screen.getByTestId('title-test');
    expect(title).toHaveAttribute('id', 'title1');
  });
});
