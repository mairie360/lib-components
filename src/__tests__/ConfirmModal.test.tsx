import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from '../components/ConfirmModal';

describe('ConfirmModal', () => {
  const defaultProps = {
    title: 'Supprimer cet élément ?',
    message: 'Cette action est irréversible.',
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
    isOpen: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the title and message when open', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  it('calls onCancel when "Annuler" button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Annuler'));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when "Supprimer" button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Supprimer'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('has the correct aria attributes for accessibility', () => {
    render(<ConfirmModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
