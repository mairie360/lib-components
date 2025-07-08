import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Paragraph } from '../components/Paragraph';

describe('Paragraph component', () => {
  it('renders the text prop', () => {
    render(<Paragraph text="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<Paragraph text="Default styles" />);
    const p = screen.getByText('Default styles');
    expect(p).toHaveClass('text-gray-500');
    expect(p).toHaveClass('text-base');
    expect(p).toHaveClass('font-normal');
  });

  it('applies custom textColor, fontSize, and fontWeight classes', () => {
    render(
      <Paragraph
        text="Custom styles"
        textColor="text-red-500"
        fontSize="text-xl"
        fontWeight="font-bold"
      />
    );
    const p = screen.getByText('Custom styles');
    expect(p).toHaveClass('text-red-500');
    expect(p).toHaveClass('text-xl');
    expect(p).toHaveClass('font-bold');
  });

  it('calls onClick when paragraph is clicked', () => {
    const onClick = jest.fn();
    render(<Paragraph text="Clickable" onClick={onClick} />);
    const p = screen.getByText('Clickable');
    fireEvent.click(p);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('passes additional props to the paragraph element', () => {
    render(<Paragraph text="With id" id="para1" data-testid="para-test" />);
    const p = screen.getByTestId('para-test');
    expect(p).toHaveAttribute('id', 'para1');
  });
});
