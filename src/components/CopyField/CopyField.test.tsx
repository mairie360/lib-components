import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { CopyField } from './CopyField';

// MAIR-1069: Figma `Base/CopyField`: label, monospace value, copy button, « Copié » feedback.
describe('MAIR-1069 CopyField', () => {
  const setClipboard = (writeText: jest.Mock) => Object.assign(navigator, { clipboard: { writeText } });
  afterEach(() => { jest.useRealTimers(); });

  it('shows the label and the value, and copies the raw value', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setClipboard(writeText);
    const onCopy = jest.fn();
    render(<CopyField label="Clé secrète" value="JBSWY3DPEHPK3PXP" display="JBSW Y3DP EHPK 3PXP" onCopy={onCopy} />);
    expect(screen.getByText('JBSW Y3DP EHPK 3PXP').tagName).toBe('CODE');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copier' })); });
    expect(writeText).toHaveBeenCalledWith('JBSWY3DPEHPK3PXP');
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Copié');
  });

  it('forgets the feedback after 1.5 s', async () => {
    jest.useFakeTimers();
    setClipboard(jest.fn().mockResolvedValue(undefined));
    render(<CopyField label="Clé" value="abc" />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copier' })); });
    expect(screen.getByRole('status')).toHaveTextContent('Copié');
    await act(async () => { jest.advanceTimersByTime(1600); });
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('selects the text and says so when the clipboard is refused', async () => {
    setClipboard(jest.fn().mockRejectedValue(new Error('denied')));
    const onCopy = jest.fn();
    render(<CopyField label="Clé" value="abc" onCopy={onCopy} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copier' })); });
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Copie impossible');
    expect(window.getSelection()?.toString()).toBe('abc');
  });

  it('takes custom labels, can hide the visible label and marks its root', () => {
    const { container } = render(<CopyField label="Identifiant" hideLabel value="x" copyLabel="Copier l’identifiant" copiedLabel="Identifiant copié" />);
    expect(screen.getByRole('button', { name: 'Copier l’identifiant' })).toBeInTheDocument();
    expect(screen.getByText('Identifiant')).toHaveClass('sr-only');
    expect(container.firstElementChild).toHaveAttribute('data-m360-component', 'CopyField');
  });

  it('has no accessibility violation', async () => {
    const { container } = render(<CopyField label="Clé secrète" value="JBSWY3DPEHPK3PXP" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
