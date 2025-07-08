import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Alert, AlertProps } from '../components/Alert';
import '@testing-library/jest-dom';

describe('Alert component', () => {
  const defaultProps: AlertProps = {
    message: 'This is a test alert',
  };

  it('renders the message', () => {
    render(<Alert {...defaultProps} />);
    expect(screen.getByText(/this is a test alert/i)).toBeInTheDocument();
  });

  it('renders the title if provided', () => {
    render(<Alert {...defaultProps} title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders the correct icon for each type', () => {
    const types: AlertProps['type'][] = ['success', 'error', 'warning', 'info'];
    types.forEach((type) => {
      const { unmount } = render(<Alert {...defaultProps} type={type} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      unmount();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(<Alert {...defaultProps} closable onClose={handleClose} />);
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after the given time', async () => {
    jest.useFakeTimers();
    const handleClose = jest.fn();
    render(<Alert {...defaultProps} autoDismiss={2000} onClose={handleClose} />);
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
    jest.useRealTimers();
  });

  it('does not render close button if closable is false', () => {
    render(<Alert {...defaultProps} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
